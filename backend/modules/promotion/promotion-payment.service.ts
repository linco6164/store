import crypto from "crypto";
import mongoose from "mongoose";

import User from "../../models/Users.js";
import { PromotionModel } from "./promotion.model.js";
import { PromotionPaymentModel } from "./promotion-payment.model.js";
import { netopiaService } from "../payment/netopia.service.js";

function validateObjectId(id: string, message: string): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
}

function generateProviderOrderId(): string {
  return `PROMO-${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
}

function splitName(user: any): {
  firstName: string;
  lastName: string;
} {
  const fullName = String(user.fullName ?? "").trim();

  if (!fullName) {
    return {
      firstName: user.username ?? "Nexora",
      lastName: "User",
    };
  }

  const parts = fullName.split(/\s+/);

  return {
    firstName: parts.shift() ?? "Nexora",
    lastName: parts.join(" ") || "User",
  };
}

function getPromotionConfirmUrl(): string {
  const value = process.env.NETOPIA_PROMOTION_CONFIRM_URL;

  if (!value?.trim()) {
    throw new Error(
      "Lipsește variabila de mediu NETOPIA_PROMOTION_CONFIRM_URL.",
    );
  }

  return value.trim();
}

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Lipsește variabila de mediu ${name}.`);
  }

  return value.trim();
}

function getPromotionReturnUrl(paymentId: string): string {
  const baseUrl = requiredEnv("NETOPIA_PROMOTION_FRONTEND_RETURN_URL");

  const separator = baseUrl.includes("?") ? "&" : "?";

  return (
    `${baseUrl}${separator}` +
    `paymentId=${encodeURIComponent(paymentId)}` +
    `&status=pending`
  );
}

/**
 * Creează plata NETOPIA pentru o promovare.
 *
 * Important:
 * - NU creează Order.
 * - NU marchează Listing-ul ca sold.
 * - Promovarea rămâne pending până la confirmarea NETOPIA.
 */
export async function createPromotionPayment(
  userId: string,
  promotionId: string,
) {
  validateObjectId(userId, "ID utilizator invalid.");
  validateObjectId(promotionId, "ID promovare invalid.");

  const user = await User.findById(userId);

  if (!user) {
    throw new Error("Utilizatorul nu există.");
  }

  const promotion = await PromotionModel.findOne({
    _id: promotionId,
    user: userId,
  }).populate("listing", "title images price currency status");

  if (!promotion) {
    throw new Error("Promovarea nu există sau nu îți aparține.");
  }

  // Promovarea poate fi plătită doar cât timp este pending.
  if (promotion.status !== "pending") {
    throw new Error("Această promovare nu mai poate fi plătită.");
  }

  if (promotion.amount <= 0) {
    throw new Error("Valoarea promovării este invalidă.");
  }

  // ============================================================
  // CĂUTĂM ULTIMA PLATĂ PENTRU ACEASTĂ PROMOVARE
  // ============================================================

  const existingPayment = await PromotionPaymentModel.findOne({
    promotion: promotion._id,
    user: user._id,
  }).sort({
    createdAt: -1,
  });

  let payment = existingPayment;

  // ============================================================
  // PLATA ESTE DEJA CONFIRMATĂ
  // ============================================================

  if (payment?.status === "paid") {
    throw new Error("Această promovare a fost deja plătită.");
  }

  // ============================================================
  // EXISTĂ O PLATĂ PENDING
  // ============================================================
  //
  // O reutilizăm.
  // Nu creăm o nouă plată.
  //

  if (payment?.status === "pending") {
    // payment rămâne cel existent.
  }

  // ============================================================
  // NU EXISTĂ PLATĂ SAU ULTIMA PLATĂ A EȘUAT / A FOST ANULATĂ
  // ============================================================
  //
  // Creăm o nouă tranzacție NETOPIA.
  //

  if (
    !payment ||
    payment.status === "failed" ||
    payment.status === "cancelled"
  ) {
    payment = await PromotionPaymentModel.create({
      user: user._id,
      promotion: promotion._id,
      provider: "netopia",
      providerOrderId: generateProviderOrderId(),
      amount: promotion.amount,
      currency: promotion.currency,
      status: "pending",
    });
  }

  // ============================================================
  // BILLING
  // ============================================================

  const { firstName, lastName } = splitName(user);

  // ============================================================
  // NETOPIA CHECKOUT
  // ============================================================

  const checkoutData = netopiaService.createCheckoutEnvelope({
    orderId: payment.providerOrderId,

    amount: payment.amount,

    currency: payment.currency,

    details: `Promovare anunț Nexora Store - ` + `${promotion.duration} ore`,

    confirmUrl: getPromotionConfirmUrl(),

    returnUrl: getPromotionReturnUrl(String(payment._id)),

    billing: {
      email: user.email,

      firstName,

      lastName,

      phone: user.phone ?? undefined,

      address: undefined,

      city: user.city ?? undefined,

      county: user.county ?? undefined,

      postalCode: user.postalCode ?? undefined,

      country: user.country ?? "RO",
    },
  });

  // ============================================================
  // RESPONSE
  // ============================================================

  return {
    paymentId: payment._id.toString(),

    promotionId: promotion._id.toString(),

    providerOrderId: payment.providerOrderId,

    amount: payment.amount,

    currency: payment.currency,

    status: payment.status,

    checkout: checkoutData,
  };
}

/**
 * Găsește plata după ID-ul intern.
 */
export async function getPromotionPayment(userId: string, paymentId: string) {
  validateObjectId(userId, "ID utilizator invalid.");
  validateObjectId(paymentId, "ID plată invalid.");

  const payment = await PromotionPaymentModel.findOne({
    _id: paymentId,
    user: userId,
  }).populate({
    path: "promotion",
    populate: {
      path: "listing",
      select: "title images price currency status",
    },
  });

  if (!payment) {
    throw new Error("Plata nu există.");
  }

  return {
    _id: payment._id,
    user: payment.user,
    promotion: payment.promotion,
    provider: payment.provider,
    providerOrderId: payment.providerOrderId,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
    ntpId: payment.ntpId,
    action: payment.action,
    processedAmount: payment.processedAmount,
    paidAt: payment.paidAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  };
}

/**
 * Procesează notificarea NETOPIA.
 *
 * Pentru promovare:
 * - plata confirmată => promotion.active
 * - plata eșuată => promotion.pending / payment.failed
 *
 * NU se creează Order.
 * NU se modifică statusul listingului.
 */
export async function handlePromotionNotification(input: {
  envKey: string;
  data: string;
  cipher?: string;
  iv?: string;
}) {
  const notification = netopiaService.decryptNotification(input);

  const payment = await PromotionPaymentModel.findOne({
    providerOrderId: notification.orderId,
  });

  if (!payment) {
    throw new Error(
      `Plata pentru promovare nu a fost găsită: ${notification.orderId}`,
    );
  }

  /**
   * Idempotency:
   * dacă plata este deja paid, nu mai facem nimic.
   */
  if (payment.status === "paid") {
    return {
      payment,
      promotion: await PromotionModel.findById(payment.promotion),
      alreadyProcessed: true,
    };
  }

  /**
   * NETOPIA errorCode !== 0 = plata eșuată.
   */
  if (notification.errorCode !== 0) {
    payment.status = "failed";
    payment.ntpId = notification.ntpId;
    payment.action = notification.action;
    payment.processedAmount = notification.processedAmount;
    payment.errorCode = String(notification.errorCode);
    payment.errorMessage = notification.errorMessage;
    payment.rawNotification = notification.raw;

    await payment.save();

    return {
      payment,
      promotion: await PromotionModel.findById(payment.promotion),
      alreadyProcessed: false,
    };
  }

  /**
   * Verificăm suma procesată.
   */
  if (
    notification.processedAmount !== undefined &&
    Math.abs(notification.processedAmount - payment.amount) > 0.01
  ) {
    payment.status = "failed";
    payment.ntpId = notification.ntpId;
    payment.action = notification.action;
    payment.processedAmount = notification.processedAmount;
    payment.errorCode = "AMOUNT_MISMATCH";
    payment.errorMessage =
      "Suma confirmată de NETOPIA nu corespunde sumei promovării.";
    payment.rawNotification = notification.raw;

    await payment.save();

    throw new Error(
      "Suma confirmată de NETOPIA nu corespunde plății promovării.",
    );
  }

  if (
    notification.currency &&
    notification.currency.toUpperCase() !== payment.currency.toUpperCase()
  ) {
    payment.status = "failed";
    payment.ntpId = notification.ntpId;
    payment.action = notification.action;
    payment.processedAmount = notification.processedAmount;
    payment.errorCode = "CURRENCY_MISMATCH";
    payment.errorMessage = "Moneda confirmată de NETOPIA nu corespunde plății.";
    payment.rawNotification = notification.raw;

    await payment.save();

    throw new Error("Moneda confirmată de NETOPIA nu corespunde plății.");
  }

  const session = await mongoose.startSession();

  try {
    let result: {
      payment: any;
      promotion: any;
      alreadyProcessed: boolean;
    } | null = null;

    await session.withTransaction(async () => {
      const lockedPayment = await PromotionPaymentModel.findOne({
        _id: payment._id,
      }).session(session);

      if (!lockedPayment) {
        throw new Error("Plata promovării nu mai există.");
      }

      if (lockedPayment.status === "paid") {
        const existingPromotion = await PromotionModel.findById(
          lockedPayment.promotion,
        ).session(session);

        result = {
          payment: lockedPayment,
          promotion: existingPromotion,
          alreadyProcessed: true,
        };

        return;
      }

      const promotion = await PromotionModel.findById(
        lockedPayment.promotion,
      ).session(session);

      if (!promotion) {
        throw new Error("Promovarea nu mai există.");
      }

      if (promotion.status !== "pending") {
        throw new Error(`Promovarea are deja statusul ${promotion.status}.`);
      }

      const now = new Date();

      const expiresAt = new Date(
        now.getTime() + promotion.duration * 60 * 60 * 1000,
      );

      /**
       * Activăm promovarea numai după plata confirmată.
       */
      promotion.status = "active";
      promotion.startsAt = now;
      promotion.expiresAt = expiresAt;

      // Legăm promovarea de plata confirmată.
      promotion.payment = lockedPayment._id;

      await promotion.save({ session });

      lockedPayment.status = "paid";
      lockedPayment.ntpId = notification.ntpId;
      lockedPayment.action = notification.action;
      lockedPayment.processedAmount = notification.processedAmount;
      lockedPayment.errorCode = String(notification.errorCode);
      lockedPayment.errorMessage = notification.errorMessage;
      lockedPayment.rawNotification = notification.raw;
      lockedPayment.paidAt = now;

      await lockedPayment.save({ session });

      result = {
        payment: lockedPayment,
        promotion,
        alreadyProcessed: false,
      };
    });

    if (!result) {
      throw new Error(
        "Procesarea plății promovării nu a returnat un rezultat.",
      );
    }

    return result;
  } finally {
    await session.endSession();
  }
}
