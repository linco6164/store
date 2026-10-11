import crypto from "crypto";
import mongoose from "mongoose";

import User from "../../models/Users.js";

import { ListingModel } from "../listing/listing.model.js";

import Order from "../order/order.model.js";

import WalletTransaction from "../wallet/wallet.model.js";

import { AddressModel } from "../profile/address.model.js";

import { samedayService } from "../sameday/sameday.service.js";

import SavedCardModel from "./saved-card.model.js";

import PaymentModel, { PaymentDocument } from "./payment.model.js";

import { netopiaService } from "./netopia.service.js";

import { googlePayService } from "./google-pay.service.js";

import { notificationService } from "../notification/notification.service.js";

// ============================================================
// CONSTANTS
// ============================================================

const BUYER_PROTECTION_RATE = 0.05;

const BUYER_PROTECTION_MIN = 2.99;

const SHIPPING_COSTS = {
  courier: 14.99,

  pickup_point: 11.99,
} as const;

// ============================================================
// TYPES
// ============================================================

type DeliveryMethod = "courier" | "pickup_point";

type PaymentMethod = "card" | "google_pay" | "apple_pay";

// ============================================================
// HELPERS
// ============================================================

function normalizeName(value: string | undefined, fallback: string) {
  const clean = String(value ?? "").trim();

  return clean || fallback;
}

function splitName(fullName: string, username: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {
      firstName: username || "Nexora",

      lastName: "User",
    };
  }

  if (parts.length === 1) {
    return {
      firstName: parts[0],

      lastName: username || "User",
    };
  }

  return {
    firstName: parts[0],

    lastName: parts.slice(1).join(" "),
  };
}

// ============================================================
// PAYMENT SERVICE
// ============================================================

class PaymentService {
  // ==========================================================
  // CREATE NETOPIA PAYMENT
  // ==========================================================

  async createNetopiaPayment(
    buyerId: string,

    listingId: string,

    addressId: string,

    deliveryMethod: DeliveryMethod,

    paymentMethod: PaymentMethod,

    savedCardId?: string,

    destinationLockerId?: number,
  ) {
    // ========================================================
    // VALIDATE LISTING
    // ========================================================

    if (!mongoose.isValidObjectId(listingId)) {
      throw new Error("INVALID_LISTING_ID");
    }

    // ========================================================
    // VALIDATE ADDRESS
    // ========================================================

    if (!mongoose.isValidObjectId(addressId)) {
      throw new Error("INVALID_ADDRESS_ID");
    }

    // ========================================================
    // VALIDATE DELIVERY METHOD
    // ========================================================

    if (deliveryMethod !== "courier" && deliveryMethod !== "pickup_point") {
      throw new Error("INVALID_DELIVERY_METHOD");
    }

    // ========================================================
    // VALIDATE PAYMENT METHOD
    // ========================================================

    if (
      paymentMethod !== "card" &&
      paymentMethod !== "google_pay" &&
      paymentMethod !== "apple_pay"
    ) {
      throw new Error("INVALID_PAYMENT_METHOD");
    }

    // ========================================================
    // VALIDATE SAVED CARD
    // ========================================================

    if (
      paymentMethod === "card" &&
      (!savedCardId || !mongoose.isValidObjectId(savedCardId))
    ) {
      throw new Error("SAVED_CARD_REQUIRED");
    }

    // ========================================================
    // LOAD BUYER + LISTING + ADDRESS
    // ========================================================

    const [buyer, listing, address] = await Promise.all([
      User.findById(buyerId).select(
        [
          "email",
          "fullName",
          "username",
          "phone",
          "city",
          "county",
          "postalCode",
          "country",
        ].join(" "),
      ),

      ListingModel.findOne({
        _id: listingId,

        status: "active",
      }),

      AddressModel.findOne({
        _id: addressId,

        user: buyerId,
      }),
    ]);

    // ========================================================
    // BUYER
    // ========================================================

    if (!buyer) {
      throw new Error("BUYER_NOT_FOUND");
    }

    // ========================================================
    // LISTING
    // ========================================================

    if (!listing) {
      throw new Error("LISTING_NOT_AVAILABLE");
    }

    // ========================================================
    // ADDRESS
    // ========================================================

    if (!address) {
      throw new Error("ADDRESS_NOT_FOUND");
    }

    // ========================================================
    // SELLER
    // ========================================================

    const sellerId = listing.seller.toString();

    if (sellerId === buyerId) {
      throw new Error("CANNOT_BUY_OWN_LISTING");
    }

    // ========================================================
    // SAMEDAY EASYBOX
    // ========================================================

    let verifiedLockerId: number | null = null;

    let pickupPointId: string | null = null;

    let pickupPointName: string | null = null;

    let pickupPointAddress: string | null = null;

    if (deliveryMethod === "pickup_point") {
      const lockerId = Number(destinationLockerId);

      if (!Number.isInteger(lockerId) || lockerId <= 0) {
        throw new Error("EASYBOX_REQUIRED");
      }

      // ------------------------------------------------------
      // Important:
      // Nu avem încredere în numele/adresa primite din Flutter.
      //
      // Verificăm ID-ul direct la Sameday și salvăm datele
      // returnate de Sameday.
      // ------------------------------------------------------

      const response = await samedayService.getOohLocations({
        listingType: 0,

        oohList: String(lockerId),

        countryCode: "RO",

        page: 1,

        countPerPage: 20,
      });

      const locker = response.data.find(
        (item) =>
          item.oohId === lockerId &&
          item.oohType === 0 &&
          item.clientVisible !== 0,
      );

      if (!locker) {
        throw new Error("EASYBOX_NOT_FOUND");
      }

      verifiedLockerId = locker.oohId;

      pickupPointId = String(locker.oohId);

      pickupPointName = String(locker.name ?? "").trim();

      pickupPointAddress = [locker.address, locker.city, locker.county]
        .map((value) => String(value ?? "").trim())
        .filter((value) => value.length > 0)
        .join(", ");

      if (!pickupPointName) {
        throw new Error("EASYBOX_INVALID_DATA");
      }
    }

    // ========================================================
    // PRICE
    // ========================================================

    const itemPrice = Number(listing.price);

    if (!Number.isFinite(itemPrice) || itemPrice <= 0) {
      throw new Error("INVALID_LISTING_PRICE");
    }

    const currency = String(listing.currency ?? "RON").toUpperCase();

    if (currency !== "RON") {
      throw new Error("UNSUPPORTED_CURRENCY");
    }

    // ========================================================
    // BUYER PROTECTION
    // ========================================================

    const buyerProtectionFee = Math.max(
      Number((itemPrice * BUYER_PROTECTION_RATE).toFixed(2)),

      BUYER_PROTECTION_MIN,
    );

    // ========================================================
    // SHIPPING
    // ========================================================

    const shippingCost = SHIPPING_COSTS[deliveryMethod];

    // ========================================================
    // TOTAL
    // ========================================================

    const amount = Number(
      (itemPrice + buyerProtectionFee + shippingCost).toFixed(2),
    );

    // ========================================================
    // SAVED CARD
    // ========================================================

    let savedCard: mongoose.Document | null = null;

    if (paymentMethod === "card") {
      savedCard = await SavedCardModel.findOne({
        _id: savedCardId,

        user: buyerId,

        provider: "netopia",
      });

      if (!savedCard) {
        throw new Error("SAVED_CARD_NOT_FOUND");
      }
    }

    // ========================================================
    // EXISTING PAYMENT
    // ========================================================

    /**
     * Nu reutilizăm automat orice payment pending.
     *
     * Payment-ul trebuie să aibă aceeași:
     * - adresă
     * - metodă de livrare
     * - Easybox
     * - metodă de plată
     * - card
     *
     * Altfel riscăm ca utilizatorul să aleagă Easybox și să
     * primească un payment pending creat anterior pentru curier.
     */

    const existingPayment = await PaymentModel.findOne({
      buyer: buyerId,

      listing: listingId,

      address: address._id,

      status: "pending",

      deliveryMethod,

      paymentMethod,

      destinationLockerId:
        deliveryMethod === "pickup_point" ? verifiedLockerId : null,

      savedCard: paymentMethod === "card" ? savedCard?._id : null,
    }).sort({
      createdAt: -1,
    });

    if (existingPayment) {
      if (paymentMethod === "google_pay") {
        return this.getPaymentSummary(existingPayment);
      }

      return await this.getCheckoutData(
        existingPayment,

        buyer,

        listing,
      );
    }

    // ========================================================
    // PROVIDER ORDER ID
    // ========================================================

    const providerOrderId = `NX-${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")
      .toUpperCase()}`;

    // ========================================================
    // CREATE PAYMENT
    // ========================================================

    const payment = await PaymentModel.create({
      buyer: buyerId,

      seller: sellerId,

      listing: listingId,

      address: address._id,

      // ----------------------------------------------------
      // DELIVERY
      // ----------------------------------------------------

      deliveryMethod,

      pickupPointId,

      pickupPointName,

      pickupPointAddress,

      destinationLockerId: verifiedLockerId,

      // ----------------------------------------------------
      // PAYMENT METHOD
      // ----------------------------------------------------

      paymentMethod,

      savedCard: paymentMethod === "card" ? savedCard?._id : null,

      // ----------------------------------------------------
      // PRICE
      // ----------------------------------------------------

      itemPrice,

      buyerProtectionFee,

      shippingCost,

      amount,

      currency,

      // ----------------------------------------------------
      // PROVIDER
      // ----------------------------------------------------

      provider: "netopia",

      providerOrderId,

      status: "pending",
    });

    // ========================================================
    // CREATE NETOPIA CHECKOUT
    // ========================================================

    try {
      if (paymentMethod === "google_pay") {
        return this.getPaymentSummary(payment);
      }

      return await this.getCheckoutData(
        payment,

        buyer,

        listing,
      );
    } catch (error) {
      await PaymentModel.findByIdAndDelete(payment._id);

      throw error;
    }
  }

  private getPaymentSummary(payment: PaymentDocument) {
    return {
      paymentId: payment._id.toString(),
      orderId: payment.providerOrderId,
      amount: payment.amount,
      currency: payment.currency,
      itemPrice: payment.itemPrice,
      buyerProtectionFee: payment.buyerProtectionFee,
      shippingCost: payment.shippingCost,
      deliveryMethod: payment.deliveryMethod,
      destinationLockerId: payment.destinationLockerId ?? null,
      pickupPointId: payment.pickupPointId ?? null,
      pickupPointName: payment.pickupPointName ?? null,
      pickupPointAddress: payment.pickupPointAddress ?? null,
      paymentMethod: payment.paymentMethod,
      status: payment.status,
    };
  }

  // ==========================================================
  // GET CHECKOUT DATA
  // ==========================================================

  async getCheckoutData(
    payment: PaymentDocument,

    buyer?: any,

    listing?: any,
  ) {
    // ========================================================
    // NETOPIA URLS
    // ========================================================

    const confirmUrl = String(process.env.NETOPIA_CONFIRM_URL ?? "").trim();

    const returnUrl = String(process.env.NETOPIA_RETURN_URL ?? "").trim();

    if (!confirmUrl) {
      throw new Error("Lipsește NETOPIA_CONFIRM_URL.");
    }

    if (!returnUrl) {
      throw new Error("Lipsește NETOPIA_RETURN_URL.");
    }

    // ========================================================
    // BUYER NAME
    // ========================================================

    const buyerFullName = normalizeName(
      buyer?.fullName,

      buyer?.username ?? "Nexora User",
    );

    const { firstName, lastName } = splitName(
      buyerFullName,

      buyer?.username ?? "User",
    );

    // ========================================================
    // PAYMENT DETAILS
    // ========================================================

    const details = `Nexora Store - ${listing?.title ?? "Produs"}`;

    // ========================================================
    // TOKENIZED CARD
    // ========================================================

    let tokenId: string | undefined;

    let panMasked: string | undefined;

    if (payment.paymentMethod === "card") {
      const paymentBuyerId = buyer?._id ?? payment.buyer;

      const savedCard = await SavedCardModel.findOne({
        _id: payment.savedCard,

        user: paymentBuyerId,

        provider: "netopia",
      });

      if (!savedCard) {
        throw new Error("SAVED_CARD_NOT_FOUND");
      }

      tokenId = savedCard.providerReference;

      panMasked = savedCard.panMasked;

      if (!tokenId || !panMasked) {
        throw new Error("SAVED_CARD_TOKEN_INCOMPLETE");
      }
    }

    // ========================================================
    // NETOPIA ENVELOPE
    // ========================================================

    const checkout = netopiaService.createCheckoutEnvelope({
      orderId: payment.providerOrderId,

      amount: payment.amount,

      currency: payment.currency,

      details,

      customerId: String(buyer?._id ?? payment.buyer),

      tokenId,

      panMasked,

      oneClick: payment.paymentMethod === "card",

      confirmUrl,

      returnUrl: `${returnUrl}${
        returnUrl.includes("?") ? "&" : "?"
      }paymentId=${payment._id.toString()}`,

      billing: {
        email: buyer?.email ?? "",

        firstName,

        lastName,

        phone: buyer?.phone,

        city: buyer?.city,

        county: buyer?.county,

        postalCode: buyer?.postalCode,

        country: buyer?.country ?? "RO",
      },
    });

    // ========================================================
    // RESPONSE
    // ========================================================

    return {
      paymentId: payment._id.toString(),

      orderId: payment.providerOrderId,

      amount: payment.amount,

      currency: payment.currency,

      itemPrice: payment.itemPrice,

      buyerProtectionFee: payment.buyerProtectionFee,

      shippingCost: payment.shippingCost,

      // ------------------------------------------------------
      // DELIVERY
      // ------------------------------------------------------

      deliveryMethod: payment.deliveryMethod,

      destinationLockerId: payment.destinationLockerId ?? null,

      pickupPointId: payment.pickupPointId ?? null,

      pickupPointName: payment.pickupPointName ?? null,

      pickupPointAddress: payment.pickupPointAddress ?? null,

      // ------------------------------------------------------
      // PAYMENT
      // ------------------------------------------------------

      paymentMethod: payment.paymentMethod,

      status: payment.status,

      checkout,
    };
  }

  // ==========================================================
  // GOOGLE PAY
  // ==========================================================

  getGooglePayConfiguration() {
    return googlePayService.getConfiguration();
  }

  async processGooglePay(input: {
    buyerId: string;
    listingId: string;
    addressId: string;
    deliveryMethod: DeliveryMethod;
    destinationLockerId?: number;
    expectedAmount: number;
    paymentData: unknown;
    apiBaseUrl: string;
    userAgent?: string;
    ipAddress?: string;
  }) {
    const gatewayToken = googlePayService.extractGatewayToken(
      input.paymentData,
    );
    const paymentSummary = await this.createNetopiaPayment(
      input.buyerId,
      input.listingId,
      input.addressId,
      input.deliveryMethod,
      "google_pay",
      undefined,
      input.destinationLockerId,
    );
    const paymentId = String(paymentSummary.paymentId ?? "");
    const payment = await PaymentModel.findOne({
      _id: paymentId,
      buyer: input.buyerId,
      paymentMethod: "google_pay",
    });

    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    if (payment.status === "paid") {
      return {
        paymentId: payment._id.toString(),
        status: "paid" as const,
        orderId: payment.order?.toString() ?? null,
      };
    }

    if (Math.abs(Number(input.expectedAmount) - payment.amount) > 0.009) {
      throw new Error("CHECKOUT_TOTAL_CHANGED");
    }

    if (payment.action === "google_pay_3ds_required") {
      const state = googlePayService.createActionState(
        payment._id.toString(),
        payment.providerOrderId,
      );

      return {
        paymentId: payment._id.toString(),
        status: "requires_action" as const,
        actionUrl:
          `${input.apiBaseUrl}/payments/google-pay/action/` +
          `${encodeURIComponent(payment._id.toString())}?state=${state}`,
      };
    }

    const [buyer, listing, address] = await Promise.all([
      User.findById(input.buyerId).select(
        ["email", "fullName", "username", "phone"].join(" "),
      ),
      ListingModel.findById(payment.listing).select(
        ["title", "category", "price", "currency"].join(" "),
      ),
      AddressModel.findOne({
        _id: payment.address,
        user: input.buyerId,
      }),
    ]);

    if (!buyer) {
      throw new Error("BUYER_NOT_FOUND");
    }

    if (!listing) {
      throw new Error("LISTING_NOT_AVAILABLE");
    }

    if (!address) {
      throw new Error("ADDRESS_NOT_FOUND");
    }

    const buyerFullName = normalizeName(
      buyer.fullName,
      buyer.username ?? "Nexora User",
    );
    const { firstName, lastName } = splitName(
      buyerFullName,
      buyer.username ?? "User",
    );
    const state = googlePayService.createActionState(
      payment._id.toString(),
      payment.providerOrderId,
    );
    const addressDetails = [
      `${address.street} ${address.number}`.trim(),
      address.building ? `bl. ${address.building}` : "",
      address.staircase ? `sc. ${address.staircase}` : "",
      address.floor ? `et. ${address.floor}` : "",
      address.apartment ? `ap. ${address.apartment}` : "",
    ]
      .filter(Boolean)
      .join(", ");

    const providerResponse = await googlePayService.startPayment({
      paymentId: payment._id.toString(),
      providerOrderId: payment.providerOrderId,
      amount: payment.amount,
      currency: payment.currency,
      gatewayToken,
      notifyUrl: `${input.apiBaseUrl}/payments/google-pay/notify`,
      redirectUrl:
        `${input.apiBaseUrl}/payments/google-pay/3ds-return/` +
        `${encodeURIComponent(payment._id.toString())}?state=${state}`,
      buyer: {
        id: buyer._id.toString(),
        email: String(buyer.email ?? ""),
        firstName,
        lastName,
        phone: String(buyer.phone ?? ""),
      },
      address: {
        city: address.city,
        county: address.county,
        postalCode: address.postalCode,
        details: addressDetails,
      },
      product: {
        name: listing.title,
        code: listing._id.toString(),
        category: listing.category,
        price: Number(listing.price),
      },
      userAgent: input.userAgent,
      ipAddress: input.ipAddress,
    });

    return this.applyGooglePayProviderResponse(
      payment,
      providerResponse,
      input.apiBaseUrl,
    );
  }

  async getGooglePayAction(paymentId: string, state: string) {
    if (!mongoose.isValidObjectId(paymentId)) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    const payment = await PaymentModel.findOne({
      _id: paymentId,
      paymentMethod: "google_pay",
    });

    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    if (
      !googlePayService.verifyActionState(
        payment._id.toString(),
        payment.providerOrderId,
        state,
      )
    ) {
      throw new Error("GOOGLE_PAY_ACTION_INVALID");
    }

    if (
      payment.status !== "pending" ||
      payment.action !== "google_pay_3ds_required"
    ) {
      throw new Error("GOOGLE_PAY_ACTION_FINISHED");
    }

    const raw = payment.rawNotification as Record<string, any> | null;
    const payload = raw?.googlePayResponse;
    const customerAction = payload?.customerAction;
    const actionUrl = String(customerAction?.url ?? "").trim();
    const formData = customerAction?.formData;

    if (!actionUrl || !formData || typeof formData !== "object") {
      throw new Error("GOOGLE_PAY_ACTION_INVALID");
    }

    const parsedActionUrl = new URL(actionUrl);
    const actionHostname = parsedActionUrl.hostname.toLowerCase();
    const allowedHost =
      parsedActionUrl.protocol === "https:" &&
      (actionHostname === "netopia-payments.com" ||
        actionHostname.endsWith(".netopia-payments.com") ||
        actionHostname === "mobilpay.ro" ||
        actionHostname.endsWith(".mobilpay.ro"));

    if (!allowedHost) {
      throw new Error("GOOGLE_PAY_ACTION_INVALID");
    }

    return {
      actionUrl: parsedActionUrl.toString(),
      formData: Object.fromEntries(
        Object.entries(formData)
          .filter(([, value]) =>
            ["string", "number", "boolean"].includes(typeof value),
          )
          .map(([key, value]) => [key, String(value)]),
      ),
    };
  }

  async completeGooglePay3ds(input: {
    paymentId: string;
    state: string;
    paRes: string;
    apiBaseUrl: string;
  }) {
    if (!mongoose.isValidObjectId(input.paymentId)) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    const payment = await PaymentModel.findOne({
      _id: input.paymentId,
      paymentMethod: "google_pay",
    });

    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    if (
      !googlePayService.verifyActionState(
        payment._id.toString(),
        payment.providerOrderId,
        input.state,
      )
    ) {
      throw new Error("GOOGLE_PAY_ACTION_INVALID");
    }

    if (payment.status === "paid") {
      return {
        paymentId: payment._id.toString(),
        status: "paid" as const,
        orderId: payment.order?.toString() ?? null,
      };
    }

    const raw = payment.rawNotification as Record<string, any> | null;
    const payload = raw?.googlePayResponse;
    const authenticationToken = String(
      payload?.customerAction?.authenticationToken ?? "",
    ).trim();
    const ntpId = String(payload?.payment?.ntpID ?? payment.ntpId ?? "").trim();
    const providerResponse = await googlePayService.verifyAuthentication({
      authenticationToken,
      ntpId,
      paRes: input.paRes,
    });

    return this.applyGooglePayProviderResponse(
      payment,
      providerResponse,
      input.apiBaseUrl,
    );
  }

  private async applyGooglePayProviderResponse(
    payment: PaymentDocument,
    response: Record<string, any>,
    apiBaseUrl: string,
  ) {
    const payload = googlePayService.unwrapResponse(response);
    const providerPayment =
      payload.payment && typeof payload.payment === "object"
        ? payload.payment
        : {};
    const providerError =
      payload.error && typeof payload.error === "object" ? payload.error : {};
    const providerStatus = Number(providerPayment.status);
    const providerCode = String(providerError.code ?? "").trim();
    const providerMessage = String(
      providerError.message ?? "Plata nu a fost aprobată.",
    ).trim();
    const ntpId = String(providerPayment.ntpID ?? "").trim();
    const processedAmount = Number(providerPayment.amount ?? payment.amount);

    if (
      (providerCode === "00" || providerCode === "0") &&
      (providerStatus === 3 || providerStatus === 5)
    ) {
      const notification = {
        orderId: payment.providerOrderId,
        ntpId: ntpId || undefined,
        action: "confirmed",
        errorCode: 0,
        errorMessage: providerMessage || undefined,
        processedAmount,
        currency: String(providerPayment.currency ?? payment.currency),
        raw: {
          source: "google_pay",
          error: providerError,
          payment: {
            amount: processedAmount,
            currency: providerPayment.currency ?? payment.currency,
            ntpID: ntpId,
            status: providerStatus,
            data: providerPayment.data ?? {},
          },
        },
      };
      const result = await this.applyNotification(payment, notification);

      return {
        paymentId: payment._id.toString(),
        status: result.paymentStatus,
        orderId: "orderId" in result ? result.orderId : null,
      };
    }

    if (providerCode === "100" && providerStatus === 15) {
      await PaymentModel.findByIdAndUpdate(payment._id, {
        $set: {
          action: "google_pay_3ds_required",
          ntpId: ntpId || null,
          errorCode: 100,
          errorMessage: providerMessage,
          rawNotification: {
            googlePayResponse: payload,
          },
        },
      });
      const state = googlePayService.createActionState(
        payment._id.toString(),
        payment.providerOrderId,
      );

      return {
        paymentId: payment._id.toString(),
        status: "requires_action" as const,
        actionUrl:
          `${apiBaseUrl}/payments/google-pay/action/` +
          `${encodeURIComponent(payment._id.toString())}?state=${state}`,
        message: "Confirmă plata în pagina securizată a băncii.",
      };
    }

    await PaymentModel.findByIdAndUpdate(payment._id, {
      $set: {
        status: "failed",
        action: "google_pay_declined",
        ntpId: ntpId || null,
        processedAmount: Number.isFinite(processedAmount)
          ? processedAmount
          : null,
        errorCode: Number.isFinite(Number(providerCode))
          ? Number(providerCode)
          : null,
        errorMessage: providerMessage,
        rawNotification: {
          source: "google_pay",
          error: providerError,
          payment: {
            amount: providerPayment.amount ?? null,
            currency: providerPayment.currency ?? null,
            ntpID: ntpId || null,
            status: Number.isFinite(providerStatus) ? providerStatus : null,
          },
        },
      },
    });

    throw new Error(`NETOPIA_GOOGLE_PAY_DECLINED:${providerMessage}`);
  }

  // ==========================================================
  // HANDLE NETOPIA NOTIFICATION
  // ==========================================================

  async handleNotification(input: {
    envKey: string;

    data: string;

    cipher?: string;

    iv?: string;
  }) {
    const notification = netopiaService.decryptNotification(input);

    const payment = await PaymentModel.findOne({
      providerOrderId: notification.orderId,

      provider: "netopia",
    });

    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    return this.applyNotification(
      payment,

      notification,
    );
  }

  // ==========================================================
  // APPLY NETOPIA NOTIFICATION
  // ==========================================================

  private async applyNotification(
    payment: PaymentDocument,

    notification: ReturnType<typeof netopiaService.decryptNotification>,
  ) {
    const action = (notification.action ?? "").toLowerCase();

    // ========================================================
    // CONFIRMED
    // ========================================================

    const isConfirmed =
      notification.errorCode === 0 &&
      (action === "confirmed" || action === "paid");

    // ========================================================
    // PENDING
    // ========================================================

    const isPending =
      notification.errorCode === 0 &&
      (action === "confirmed_pending" || action === "paid_pending");

    // ========================================================
    // PAYMENT STILL PENDING
    // ========================================================

    if (isPending) {
      await PaymentModel.findByIdAndUpdate(
        payment._id,

        {
          $set: {
            action: notification.action ?? null,

            ntpId: notification.ntpId ?? null,

            processedAmount: notification.processedAmount ?? null,

            errorCode: notification.errorCode,

            errorMessage: notification.errorMessage ?? null,

            rawNotification: notification.raw,
          },
        },
      );

      return {
        paymentStatus: "pending" as const,

        message: notification.action ?? "pending",
      };
    }

    // ========================================================
    // REFUND / CREDIT
    // ========================================================

    if (action === "credit") {
      // ======================================================
      // CREDIT FAILED
      //
      // Nu schimbăm plata din "paid" în "cancelled".
      // Comanda rămâne refund_pending pentru intervenție/retry.
      // ======================================================

      if (notification.errorCode !== 0) {
        await PaymentModel.findByIdAndUpdate(payment._id, {
          $set: {
            action: notification.action ?? null,

            ntpId: notification.ntpId ?? null,

            processedAmount: notification.processedAmount ?? null,

            errorCode: notification.errorCode,

            errorMessage:
              notification.errorMessage ?? "Refund-ul nu a fost confirmat.",

            rawNotification: notification.raw,
          },
        });

        return {
          paymentStatus: payment.status,

          message:
            notification.errorMessage ??
            "Refund-ul NETOPIA nu a fost confirmat.",
        };
      }

      // ======================================================
      // REFUNDED AMOUNT
      // ======================================================

      const refundedAmount = Number(
        notification.processedAmount ?? payment.amount,
      );

      if (!Number.isFinite(refundedAmount) || refundedAmount <= 0) {
        throw new Error("INVALID_REFUND_AMOUNT");
      }

      // Pentru moment Nexora face doar refund integral.
      if (Math.abs(refundedAmount - payment.amount) > 0.009) {
        await PaymentModel.findByIdAndUpdate(payment._id, {
          $set: {
            status: "conflict",

            action: notification.action ?? null,

            ntpId: notification.ntpId ?? null,

            processedAmount: refundedAmount,

            errorCode: notification.errorCode,

            errorMessage:
              "Suma rambursată diferă de suma aprobată pentru refund.",

            rawNotification: notification.raw,
          },
        });

        return {
          paymentStatus: "conflict" as const,

          message: "REFUND_AMOUNT_MISMATCH",
        };
      }

      // ======================================================
      // TRANSACTION
      // ======================================================

      const session = await mongoose.startSession();

      try {
        let orderId: string | null = null;

        let refundedNow = false;

        let buyerId: string | null = null;

        let sellerId: string | null = null;

        let refundReason: "buyer_issue" | "order_cancelled" | null = null;

        let finalOrderStatus: "refunded" | "cancelled" = "refunded";

        await session.withTransaction(async () => {
          // ================================================
          // LOCK PAYMENT
          // ================================================

          const lockedPayment = await PaymentModel.findById(
            payment._id,
          ).session(session);

          if (!lockedPayment) {
            throw new Error("PAYMENT_NOT_FOUND");
          }

          // ================================================
          // IDEMPOTENCY
          // ================================================

          if (lockedPayment.status === "refunded") {
            orderId = lockedPayment.order?.toString() ?? null;

            return;
          }

          if (lockedPayment.status !== "paid") {
            throw new Error("PAYMENT_NOT_REFUNDABLE");
          }

          if (!lockedPayment.order) {
            throw new Error("ORDER_NOT_FOUND");
          }

          // ================================================
          // ORDER
          // ================================================

          const order = await Order.findById(lockedPayment.order).session(
            session,
          );

          if (!order) {
            throw new Error("ORDER_NOT_FOUND");
          }

          if (order.status !== "refund_pending") {
            throw new Error("ORDER_REFUND_NOT_APPROVED");
          }

          refundReason =
            order.refundReason ??
            (order.issueResolution === "buyer_refund" ? "buyer_issue" : null);

          if (
            refundReason !== "buyer_issue" &&
            refundReason !== "order_cancelled"
          ) {
            throw new Error("ORDER_REFUND_NOT_APPROVED");
          }

          finalOrderStatus =
            refundReason === "order_cancelled" ? "cancelled" : "refunded";

          const approvedRefundAmount = Number(
            order.refundAmount ?? lockedPayment.amount,
          );

          if (
            !Number.isFinite(approvedRefundAmount) ||
            Math.abs(approvedRefundAmount - refundedAmount) > 0.009
          ) {
            throw new Error("REFUND_AMOUNT_MISMATCH");
          }

          // ================================================
          // SELLER SALE TRANSACTION
          // ================================================

          const saleTransaction = await WalletTransaction.findOne({
            order: order._id,

            user: order.seller,

            type: "sale",
          }).session(session);

          if (!saleTransaction) {
            throw new Error("SALE_TRANSACTION_NOT_FOUND");
          }

          if (saleTransaction.status !== "pending") {
            throw new Error("SALE_TRANSACTION_NOT_REFUNDABLE");
          }

          const sellerAmount = Number(saleTransaction.amount);

          if (!Number.isFinite(sellerAmount) || sellerAmount <= 0) {
            throw new Error("INVALID_SELLER_AMOUNT");
          }

          // ================================================
          // REMOVE SELLER HELD FUNDS
          //
          // Nu intră în balance, deoarece vânzarea
          // a fost rambursată cumpărătorului.
          // ================================================

          const seller = await User.findOneAndUpdate(
            {
              _id: order.seller,

              pendingBalance: {
                $gte: sellerAmount,
              },
            },

            {
              $inc: {
                pendingBalance: -sellerAmount,
              },
            },

            {
              new: true,
              session,
            },
          );

          if (!seller) {
            throw new Error("INSUFFICIENT_PENDING_BALANCE");
          }

          // ================================================
          // REJECT SALE TRANSACTION
          // ================================================

          saleTransaction.status = "rejected";

          saleTransaction.description = saleTransaction.description.replace(
            "Vânzare în așteptare:",
            "Vânzare rambursată:",
          );

          saleTransaction.set("metadata.refundedAt", new Date());

          saleTransaction.set("metadata.refundAmount", refundedAmount);

          saleTransaction.set("metadata.refundProvider", "netopia");

          await saleTransaction.save({
            session,
          });

          // ================================================
          // PAYMENT REFUNDED
          // ================================================

          lockedPayment.status = "refunded";

          lockedPayment.action = notification.action ?? null;

          lockedPayment.ntpId =
            notification.ntpId ?? lockedPayment.ntpId ?? null;

          lockedPayment.processedAmount = refundedAmount;

          lockedPayment.errorCode = notification.errorCode;

          lockedPayment.errorMessage = notification.errorMessage ?? null;

          lockedPayment.rawNotification = notification.raw;

          await lockedPayment.save({
            session,
          });

          // ================================================
          // ORDER REFUNDED
          // ================================================

          const now = new Date();

          order.status = finalOrderStatus;

          order.refundCompletedAt = now;

          order.refundAmount = refundedAmount;

          order.autoCompleteAt = null;

          await order.save({
            session,
          });

          orderId = order._id.toString();

          buyerId = order.buyer.toString();

          sellerId = order.seller.toString();

          refundedNow = true;
        });

        // ======================================================
        // REFUND NOTIFICATIONS
        //
        // Trimitem numai după commit-ul tranzacției.
        // ======================================================

        if (refundedNow && orderId && buyerId && sellerId) {
          const metadata = {
            route: "order_details",
            orderId,
            status: finalOrderStatus,
            provider: "netopia",
            refundReason: refundReason ?? "buyer_issue",
          };

          await Promise.allSettled([
            notificationService.create({
              user: buyerId,

              type: "system",

              title:
                refundReason === "order_cancelled"
                  ? "Comandă anulată"
                  : "Rambursare finalizată",

              message:
                refundReason === "order_cancelled"
                  ? "Comanda a fost anulată, iar rambursarea a fost confirmată prin metoda de plată folosită."
                  : "Rambursarea comenzii a fost confirmată. Suma a fost restituită prin metoda de plată folosită la cumpărare.",

              metadata,
            }),

            notificationService.create({
              user: sellerId,

              type: "sale",

              title:
                refundReason === "order_cancelled"
                  ? "Comandă anulată"
                  : "Comandă rambursată",

              message:
                refundReason === "order_cancelled"
                  ? "Comanda a fost anulată. Fondurile blocate pentru această vânzare au fost eliminate din soldul în așteptare."
                  : "Rambursarea către cumpărător a fost confirmată. Fondurile blocate pentru această vânzare au fost retrase din soldul în așteptare.",

              metadata,
            }),
          ]);
        }

        return {
          paymentStatus: "refunded" as const,

          orderId,
        };
      } finally {
        await session.endSession();
      }
    }

    // ========================================================
    // FAILED / CANCELLED
    // ========================================================

    if (!isConfirmed) {
      const failedStatus = action === "canceled" ? "cancelled" : "failed";

      await PaymentModel.findByIdAndUpdate(
        payment._id,

        {
          $set: {
            status: failedStatus,

            action: notification.action ?? null,

            ntpId: notification.ntpId ?? null,

            processedAmount: notification.processedAmount ?? null,

            errorCode: notification.errorCode,

            errorMessage: notification.errorMessage ?? null,

            rawNotification: notification.raw,
          },
        },
      );

      return {
        paymentStatus: failedStatus,

        message:
          notification.errorMessage ?? notification.action ?? "Plata a eșuat.",
      };
    }

    // ========================================================
    // PROCESSED AMOUNT
    // ========================================================

    const processedAmount = Number(
      notification.processedAmount ?? payment.amount,
    );

    if (!Number.isFinite(processedAmount) || processedAmount <= 0) {
      throw new Error("INVALID_PROCESSED_AMOUNT");
    }

    // ========================================================
    // AMOUNT VALIDATION
    // ========================================================

    if (Math.abs(processedAmount - payment.amount) > 0.009) {
      await PaymentModel.findByIdAndUpdate(
        payment._id,

        {
          $set: {
            status: "conflict",

            action: notification.action ?? null,

            ntpId: notification.ntpId ?? null,

            processedAmount,

            errorCode: notification.errorCode,

            errorMessage: "Suma confirmată diferă de suma comandată.",

            rawNotification: notification.raw,
          },
        },
      );

      throw new Error("PAYMENT_AMOUNT_MISMATCH");
    }

    // ========================================================
    // TRANSACTION
    // ========================================================

    const session = await mongoose.startSession();

    try {
      let orderId: string | null = null;

      await session.withTransaction(async () => {
        // ==================================================
        // LOCK PAYMENT
        // ==================================================

        const lockedPayment = await PaymentModel.findOne({
          _id: payment._id,
        }).session(session);

        if (!lockedPayment) {
          throw new Error("PAYMENT_NOT_FOUND");
        }

        // ==================================================
        // ALREADY PAID
        // ==================================================

        if (lockedPayment.status === "paid") {
          orderId = lockedPayment.order ? lockedPayment.order.toString() : null;

          return;
        }

        // ==================================================
        // MARK LISTING SOLD
        // ==================================================

        const listing = await ListingModel.findOneAndUpdate(
          {
            _id: lockedPayment.listing,

            status: "active",
          },

          {
            $set: {
              status: "sold",
            },
          },

          {
            new: true,

            session,
          },
        );

        if (!listing) {
          await PaymentModel.findByIdAndUpdate(
            lockedPayment._id,

            {
              $set: {
                status: "conflict",

                action: notification.action ?? null,

                ntpId: notification.ntpId ?? null,

                processedAmount,

                errorMessage:
                  "Produsul nu mai este disponibil la confirmarea plății.",

                rawNotification: notification.raw,
              },
            },

            {
              session,
            },
          );

          throw new Error("LISTING_ALREADY_SOLD");
        }

        // ==================================================
        // VERIFY SELLER
        // ==================================================

        if (listing.seller.toString() !== lockedPayment.seller.toString()) {
          throw new Error("SELLER_MISMATCH");
        }

        // ==================================================
        // CREATE ORDER
        // ==================================================

        const order = new Order({
          // ========================================================
          // USERS
          // ========================================================

          buyer: lockedPayment.buyer,

          seller: lockedPayment.seller,

          // ========================================================
          // LISTING
          // ========================================================

          listing: lockedPayment.listing,

          // ========================================================
          // DELIVERY
          // ========================================================

          address: lockedPayment.address ?? null,

          deliveryMethod: lockedPayment.deliveryMethod,

          destinationLockerId:
            lockedPayment.deliveryMethod === "pickup_point"
              ? (lockedPayment.destinationLockerId ?? null)
              : null,

          pickupPointId:
            lockedPayment.deliveryMethod === "pickup_point"
              ? (lockedPayment.pickupPointId ?? null)
              : null,

          pickupPointName:
            lockedPayment.deliveryMethod === "pickup_point"
              ? (lockedPayment.pickupPointName ?? null)
              : null,

          pickupPointAddress:
            lockedPayment.deliveryMethod === "pickup_point"
              ? (lockedPayment.pickupPointAddress ?? null)
              : null,

          // ========================================================
          // PRICE
          // ========================================================

          amount: lockedPayment.amount,

          currency: lockedPayment.currency,

          // ========================================================
          // STATUS
          // ========================================================

          status: "paid",
        });

        await order.save({
          session,
        });

        // ==================================================
        // SELLER PENDING BALANCE
        //
        // Vânzătorul primește doar prețul produsului.
        // Transportul și Buyer Protection NU intră în soldul lui.
        // ==================================================

        const sellerAmount = Number(lockedPayment.itemPrice);

        if (!Number.isFinite(sellerAmount) || sellerAmount <= 0) {
          throw new Error("INVALID_SELLER_AMOUNT");
        }

        await User.findByIdAndUpdate(
          lockedPayment.seller,

          {
            $inc: {
              pendingBalance: sellerAmount,
            },
          },

          {
            session,

            new: true,
          },
        );

        // ==================================================
        // WALLET TRANSACTION
        // ==================================================

        await WalletTransaction.create(
          [
            {
              user: lockedPayment.seller,

              type: "sale",

              amount: sellerAmount,

              currency: lockedPayment.currency,

              status: "pending",

              order: order._id,

              description: `Vânzare în așteptare: ${listing.title}`,
            },
          ],

          {
            session,
          },
        );

        // ==================================================
        // PAYMENT PAID
        // ==================================================

        lockedPayment.status = "paid";

        lockedPayment.order = order._id;

        lockedPayment.ntpId = notification.ntpId ?? null;

        lockedPayment.action = notification.action ?? null;

        lockedPayment.processedAmount = processedAmount;

        lockedPayment.errorCode = notification.errorCode;

        lockedPayment.errorMessage = notification.errorMessage ?? null;

        lockedPayment.rawNotification = notification.raw;

        lockedPayment.paidAt = new Date();

        await lockedPayment.save({
          session,
        });

        orderId = order._id.toString();
      });

      return {
        paymentStatus: "paid" as const,

        orderId,
      };
    } finally {
      await session.endSession();
    }
  }

  // ==========================================================
  // GET PAYMENT
  // ==========================================================

  async getPayment(
    userId: string,

    paymentId: string,
  ) {
    if (!mongoose.isValidObjectId(paymentId)) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    const payment = await PaymentModel.findOne({
      _id: paymentId,

      buyer: userId,
    })
      .populate(
        "listing",

        ["title", "price", "currency", "status", "images"].join(" "),
      )
      .populate(
        "order",

        ["amount", "currency", "status", "listing"].join(" "),
      )
      .populate(
        "address",

        [
          "county",
          "city",
          "street",
          "number",
          "building",
          "staircase",
          "floor",
          "apartment",
          "postalCode",
        ].join(" "),
      )
      .populate(
        "savedCard",

        ["provider", "brand", "last4", "expMonth", "expYear", "isDefault"].join(
          " ",
        ),
      );

    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    return payment;
  }

  // ==========================================================
  // GET PUBLIC PAYMENT
  // ==========================================================

  async getPublicPayment(paymentId: string) {
    if (!mongoose.isValidObjectId(paymentId)) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    const payment = await PaymentModel.findById(paymentId).select(
      [
        "status",
        "amount",
        "currency",
        "providerOrderId",
        "paidAt",
        "errorCode",
        "errorMessage",
        "action",
      ].join(" "),
    );

    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    return payment;
  }
}

// ============================================================
// SINGLETON
// ============================================================

export const paymentService = new PaymentService();
