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
    // FAILED / CANCELLED
    // ========================================================

    if (!isConfirmed) {
      const failedStatus =
        action === "canceled" || action === "credit" ? "cancelled" : "failed";

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
        // SELLER BALANCE
        // ==================================================

        await User.findByIdAndUpdate(
          lockedPayment.seller,

          {
            $inc: {
              balance: lockedPayment.amount,
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

              amount: lockedPayment.amount,

              currency: lockedPayment.currency,

              status: "completed",

              order: order._id,

              description: `Vânzare: ${listing.title}`,
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
