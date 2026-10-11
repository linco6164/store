import mongoose from "mongoose";
import OrderModel from "./order.model.js";

import User from "../../models/Users.js";
import WalletTransaction from "../wallet/wallet.model.js";
import PaymentModel from "../payment/payment.model.js";

import { ListingModel } from "../listing/listing.model.js";

import { notificationService } from "../notification/notification.service.js";

export async function getBuyerOrders(userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("ID-ul utilizatorului este invalid.");
  }

  return OrderModel.find({
    buyer: userId,
  })
    .populate("seller", "username avatar fullName")
    .populate("listing", "title images price currency status")
    .sort({ createdAt: -1 });
}

export async function getSellerOrders(userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("ID-ul utilizatorului este invalid.");
  }

  return OrderModel.find({
    seller: userId,
  })
    .populate("buyer", "username avatar fullName")
    .populate("listing", "title images price currency status")
    .sort({ createdAt: -1 });
}

export async function getOrderById(orderId: string, userId: string) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("ID-ul comenzii este invalid.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("ID-ul utilizatorului este invalid.");
  }

  const order = await OrderModel.findOne({
    _id: orderId,
    $or: [{ buyer: userId }, { seller: userId }],
  })
    .populate("buyer", "username avatar fullName")
    .populate("seller", "username avatar fullName")
    .populate("listing", "title images price currency status");

  if (!order) {
    throw new Error("Comanda nu există.");
  }

  return order;
}

export async function getCompletedBuyerOrders(userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("ID-ul utilizatorului este invalid.");
  }

  return OrderModel.find({
    buyer: userId,
    status: "completed",
  })
    .populate("seller", "username avatar fullName")
    .populate("listing", "title images price currency status")
    .sort({ createdAt: -1 });
}

export async function completeOrder(
  orderId: string,
  reason: "buyer_confirmed" | "auto_completed",
  buyerId?: string,
) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("ORDER_NOT_FOUND");
  }

  if (
    reason === "buyer_confirmed" &&
    (!buyerId || !mongoose.Types.ObjectId.isValid(buyerId))
  ) {
    throw new Error("INVALID_BUYER");
  }

  const session = await mongoose.startSession();

  try {
    let completedOrder: any = null;

    let completedNow = false;

    await session.withTransaction(async () => {
      // ==================================================
      // LOAD ORDER
      // ==================================================

      const order = await OrderModel.findById(orderId).session(session);

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      // ==================================================
      // BUYER VALIDATION
      // ==================================================

      if (reason === "buyer_confirmed" && order.buyer.toString() !== buyerId) {
        throw new Error("ORDER_NOT_OWNED_BY_BUYER");
      }

      // ==================================================
      // IDEMPOTENCY
      // ==================================================

      if (order.status === "completed") {
        completedOrder = order;

        return;
      }

      // ==================================================
      // MUST BE DELIVERED
      // ==================================================

      if (order.status !== "delivered") {
        throw new Error("ORDER_NOT_DELIVERED");
      }

      // ==================================================
      // SALE TRANSACTION
      // ==================================================

      const saleTransaction = await WalletTransaction.findOne({
        order: order._id,

        user: order.seller,

        type: "sale",
      }).session(session);

      if (!saleTransaction) {
        throw new Error("SALE_TRANSACTION_NOT_FOUND");
      }

      if (
        saleTransaction.status !== "pending" &&
        saleTransaction.status !== "completed"
      ) {
        throw new Error("SALE_TRANSACTION_NOT_RELEASABLE");
      }

      // ==================================================
      // NEW FLOW
      // pending sale -> release funds
      // ==================================================

      if (saleTransaction.status === "pending") {
        const sellerAmount = Number(saleTransaction.amount);

        if (!Number.isFinite(sellerAmount) || sellerAmount <= 0) {
          throw new Error("INVALID_SELLER_AMOUNT");
        }

        // ================================================
        // MOVE MONEY
        // pendingBalance -> balance
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

              balance: sellerAmount,
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
        // COMPLETE WALLET TRANSACTION
        // ================================================

        saleTransaction.status = "completed";

        saleTransaction.description = saleTransaction.description.replace(
          "Vânzare în așteptare:",
          "Vânzare finalizată:",
        );

        saleTransaction.set("metadata.releasedAt", new Date());

        saleTransaction.set("metadata.releaseReason", reason);

        await saleTransaction.save({
          session,
        });
      }

      // ==================================================
      // IMPORTANT:
      //
      // Dacă tranzacția este deja "completed",
      // NU mai credităm vânzătorul încă o dată.
      //
      // Asta protejează și comenzile mai vechi.
      // ==================================================

      const now = new Date();

      // ==================================================
      // COMPLETE ORDER
      // ==================================================

      order.status = "completed";

      order.completedAt = now;

      order.completionReason = reason;

      order.autoCompleteAt = null;

      if (reason === "buyer_confirmed") {
        order.buyerConfirmedAt = now;
      }

      await order.save({
        session,
      });

      completedOrder = order;
      completedNow = true;
    });

    // ==========================================================
    // COMPLETION NOTIFICATIONS
    //
    // Le trimitem numai DUPĂ commit-ul tranzacției.
    // Dacă tranzacția eșuează, nu trimitem notificări false.
    // ==========================================================

    if (completedNow && completedOrder) {
      const orderIdValue = completedOrder._id.toString();

      const metadata = {
        route: "order_details",

        orderId: orderIdValue,

        completionReason: reason,

        provider: "nexora",

        status: "completed",
      };

      const buyerMessage =
        reason === "buyer_confirmed"
          ? "Ai confirmat că totul este în regulă. Comanda a fost finalizată."
          : "Perioada de verificare a expirat, iar comanda a fost finalizată automat.";

      const sellerMessage =
        reason === "buyer_confirmed"
          ? "Cumpărătorul a confirmat comanda. Banii din vânzare sunt acum disponibili."
          : "Comanda a fost finalizată automat. Banii din vânzare sunt acum disponibili.";

      await Promise.allSettled([
        notificationService.create({
          user: completedOrder.buyer.toString(),

          type: "system",

          title: "Comandă finalizată",

          message: buyerMessage,

          metadata,
        }),

        notificationService.create({
          user: completedOrder.seller.toString(),

          type: "sale",

          title: "Vânzare finalizată",

          message: sellerMessage,

          metadata,
        }),
      ]);
    }

    return completedOrder;
  } finally {
    await session.endSession();
  }
}

export async function markOrderDelivered(orderId: string) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  // ==========================================================
  // ALREADY COMPLETED
  // ==========================================================

  if (order.status === "completed") {
    return order;
  }

  // ==========================================================
  // ALREADY DELIVERED
  //
  // Păstrăm aceeași dată dacă evenimentul Sameday
  // este primit din nou.
  // ==========================================================

  if (order.status === "delivered") {
    if (!order.deliveredAt || !order.autoCompleteAt) {
      const deliveredAt = order.deliveredAt ?? new Date();

      order.deliveredAt = deliveredAt;

      order.autoCompleteAt = new Date(
        deliveredAt.getTime() + 48 * 60 * 60 * 1000,
      );

      await order.save();
    }

    return order;
  }

  // ==========================================================
  // DELIVERY CAN ONLY FOLLOW SHIPPING
  // ==========================================================

  if (order.status !== "shipped" && order.status !== "processing") {
    throw new Error("ORDER_CANNOT_BE_MARKED_DELIVERED");
  }

  const deliveredAt = new Date();

  const autoCompleteAt = new Date(deliveredAt.getTime() + 48 * 60 * 60 * 1000);

  order.status = "delivered";

  order.deliveredAt = deliveredAt;

  order.autoCompleteAt = autoCompleteAt;

  await order.save();

  return order;
}

export async function reportOrderIssue(
  orderId: string,
  buyerId: string,
  reason:
    | "item_not_as_described"
    | "damaged"
    | "wrong_item"
    | "missing_item"
    | "counterfeit"
    | "other",
  details?: string,
) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("ORDER_NOT_FOUND");
  }

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    throw new Error("INVALID_BUYER");
  }

  const allowedReasons = [
    "item_not_as_described",
    "damaged",
    "wrong_item",
    "missing_item",
    "counterfeit",
    "other",
  ];

  if (!allowedReasons.includes(reason)) {
    throw new Error("INVALID_ISSUE_REASON");
  }

  const cleanDetails = String(details ?? "").trim();

  if (cleanDetails.length > 2000) {
    throw new Error("ISSUE_DETAILS_TOO_LONG");
  }

  if (reason === "other" && cleanDetails.length < 5) {
    throw new Error("ISSUE_DETAILS_REQUIRED");
  }

  // ==========================================================
  // ATOMIC UPDATE
  //
  // Comanda trebuie să fie încă delivered în momentul update-ului.
  // Astfel evităm cursa cu job-ul de auto-complete.
  // ==========================================================

  const order = await OrderModel.findOneAndUpdate(
    {
      _id: orderId,

      buyer: buyerId,

      status: "delivered",
    },

    {
      $set: {
        status: "issue_reported",

        issueReportedAt: new Date(),

        issueReason: reason,

        issueDetails: cleanDetails || null,

        issueStatus: "open",

        // Oprim finalizarea automată.
        autoCompleteAt: null,
      },
    },

    {
      new: true,
    },
  );

  if (order) {
    return order;
  }

  // ==========================================================
  // DETERMINE WHY IT FAILED
  // ==========================================================

  const existingOrder = await OrderModel.findById(orderId).select(
    "buyer status issueStatus",
  );

  if (!existingOrder) {
    throw new Error("ORDER_NOT_FOUND");
  }

  if (existingOrder.buyer.toString() !== buyerId) {
    throw new Error("ORDER_NOT_OWNED_BY_BUYER");
  }

  if (existingOrder.status === "issue_reported") {
    throw new Error("ORDER_ISSUE_ALREADY_REPORTED");
  }

  if (existingOrder.status === "completed") {
    throw new Error("ORDER_ALREADY_COMPLETED");
  }

  throw new Error("ORDER_NOT_DELIVERED");
}

export async function resolveOrderIssueSellerRelease(
  orderId: string,
  resolvedById: string,
  note?: string,
) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("ORDER_NOT_FOUND");
  }

  if (!mongoose.Types.ObjectId.isValid(resolvedById)) {
    throw new Error("INVALID_RESOLVER");
  }

  const cleanNote = String(note ?? "").trim();

  if (cleanNote.length > 2000) {
    throw new Error("ISSUE_RESOLUTION_NOTE_TOO_LONG");
  }

  const session = await mongoose.startSession();

  try {
    let resolvedOrder: any = null;

    await session.withTransaction(async () => {
      const order = await OrderModel.findById(orderId).session(session);

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (order.status !== "issue_reported") {
        throw new Error("ORDER_HAS_NO_OPEN_ISSUE");
      }

      if (order.issueStatus !== "open") {
        throw new Error("ORDER_ISSUE_ALREADY_RESOLVED");
      }

      // ==============================================
      // FIND SELLER SALE
      // ==============================================

      const saleTransaction = await WalletTransaction.findOne({
        order: order._id,
        user: order.seller,
        type: "sale",
      }).session(session);

      if (!saleTransaction) {
        throw new Error("SALE_TRANSACTION_NOT_FOUND");
      }

      // ==============================================
      // RELEASE PENDING MONEY
      // ==============================================

      if (saleTransaction.status === "pending") {
        const sellerAmount = Number(saleTransaction.amount);

        if (!Number.isFinite(sellerAmount) || sellerAmount <= 0) {
          throw new Error("INVALID_SELLER_AMOUNT");
        }

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

              balance: sellerAmount,
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

        saleTransaction.status = "completed";

        saleTransaction.description = saleTransaction.description.replace(
          "Vânzare în așteptare:",
          "Vânzare finalizată:",
        );

        saleTransaction.set("metadata.releasedAt", new Date());

        saleTransaction.set("metadata.releaseReason", "issue_seller_release");

        saleTransaction.set("metadata.resolvedBy", resolvedById);

        await saleTransaction.save({
          session,
        });
      } else if (saleTransaction.status !== "completed") {
        throw new Error("SALE_TRANSACTION_NOT_RELEASABLE");
      }

      // ==============================================
      // RESOLVE ISSUE
      // ==============================================

      const now = new Date();

      order.status = "completed";

      order.completedAt = now;

      order.autoCompleteAt = null;

      order.issueStatus = "rejected";

      order.issueResolvedAt = now;

      order.issueResolution = "seller_release";

      order.issueResolutionNote = cleanNote || null;

      order.issueResolvedBy = new mongoose.Types.ObjectId(resolvedById);

      await order.save({
        session,
      });

      resolvedOrder = order;
    });

    return resolvedOrder;
  } finally {
    await session.endSession();
  }
}

export async function resolveOrderIssueBuyerRefund(
  orderId: string,
  resolvedById: string,
  note?: string,
) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("ORDER_NOT_FOUND");
  }

  if (!mongoose.Types.ObjectId.isValid(resolvedById)) {
    throw new Error("INVALID_RESOLVER");
  }

  const cleanNote = String(note ?? "").trim();

  if (cleanNote.length > 2000) {
    throw new Error("ISSUE_RESOLUTION_NOTE_TOO_LONG");
  }

  const session = await mongoose.startSession();

  try {
    let resolvedOrder: any = null;

    let walletRefundedNow = false;

    let buyerId: string | null = null;

    let sellerId: string | null = null;

    await session.withTransaction(async () => {
      // ==================================================
      // ORDER
      // ==================================================

      const order = await OrderModel.findById(orderId).session(session);

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (order.status !== "issue_reported") {
        throw new Error("ORDER_HAS_NO_OPEN_ISSUE");
      }

      if (order.issueStatus !== "open") {
        throw new Error("ORDER_ISSUE_ALREADY_RESOLVED");
      }

      // ==================================================
      // SELLER SALE TRANSACTION
      // ==================================================

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

      // ==================================================
      // CHECK NETOPIA PAYMENT
      // ==================================================

      const payment = await PaymentModel.findOne({
        order: order._id,
      }).session(session);

      const now = new Date();

      // ==================================================
      // NETOPIA PAYMENT
      //
      // Refund extern.
      // Așteptăm confirmarea reală NETOPIA.
      // ==================================================

      if (payment) {
        if (payment.status !== "paid") {
          throw new Error("PAYMENT_NOT_REFUNDABLE");
        }

        const refundAmount = Number(payment.amount);

        if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
          throw new Error("INVALID_REFUND_AMOUNT");
        }

        order.status = "refund_pending";

        order.autoCompleteAt = null;

        order.issueStatus = "resolved";

        order.issueResolvedAt = now;

        order.issueResolution = "buyer_refund";

        order.issueResolutionNote = cleanNote || null;

        order.issueResolvedBy = new mongoose.Types.ObjectId(resolvedById);

        order.refundRequestedAt = now;

        order.refundCompletedAt = null;

        order.refundAmount = refundAmount;

        order.refundReason = "buyer_issue";

        await order.save({
          session,
        });

        resolvedOrder = order;

        return;
      }

      // ==================================================
      // WALLET PURCHASE
      // ==================================================

      const purchaseTransaction = await WalletTransaction.findOne({
        order: order._id,

        user: order.buyer,

        type: "purchase",
      }).session(session);

      if (!purchaseTransaction) {
        throw new Error("PAYMENT_SOURCE_NOT_FOUND");
      }

      if (purchaseTransaction.status !== "completed") {
        throw new Error("WALLET_PURCHASE_NOT_REFUNDABLE");
      }

      const refundAmount = Number(purchaseTransaction.amount);

      if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
        throw new Error("INVALID_REFUND_AMOUNT");
      }

      // ==================================================
      // REMOVE SELLER PENDING FUNDS
      // ==================================================

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

      // ==================================================
      // RETURN MONEY TO BUYER WALLET
      // ==================================================

      const buyer = await User.findByIdAndUpdate(
        order.buyer,

        {
          $inc: {
            balance: refundAmount,
          },
        },

        {
          new: true,

          session,
        },
      );

      if (!buyer) {
        throw new Error("BUYER_NOT_FOUND");
      }

      // ==================================================
      // SELLER SALE -> REJECTED
      // ==================================================

      saleTransaction.status = "rejected";

      saleTransaction.description = saleTransaction.description.replace(
        "Vânzare în așteptare:",
        "Vânzare rambursată:",
      );

      saleTransaction.set("metadata.refundedAt", now);

      saleTransaction.set("metadata.refundAmount", refundAmount);

      saleTransaction.set("metadata.refundProvider", "wallet");

      await saleTransaction.save({
        session,
      });

      // ==================================================
      // BUYER REFUND TRANSACTION
      // ==================================================

      await WalletTransaction.create(
        [
          {
            user: order.buyer,

            type: "refund",

            amount: refundAmount,

            currency: purchaseTransaction.currency ?? order.currency ?? "RON",

            status: "completed",

            order: order._id,

            description: "Rambursare comandă",

            metadata: {
              paymentMethod: "wallet",

              originalTransactionId: purchaseTransaction._id.toString(),

              refundedAt: now,
            },
          },
        ],

        {
          session,
        },
      );

      // ==================================================
      // ORDER REFUNDED
      // ==================================================

      order.status = "refunded";

      order.autoCompleteAt = null;

      order.issueStatus = "resolved";

      order.issueResolvedAt = now;

      order.issueResolution = "buyer_refund";

      order.issueResolutionNote = cleanNote || null;

      order.issueResolvedBy = new mongoose.Types.ObjectId(resolvedById);

      order.refundRequestedAt = now;

      order.refundCompletedAt = now;

      order.refundAmount = refundAmount;

      order.refundReason = "buyer_issue";

      await order.save({
        session,
      });

      resolvedOrder = order;

      buyerId = order.buyer.toString();

      sellerId = order.seller.toString();

      walletRefundedNow = true;
    });

    // ====================================================
    // WALLET REFUND NOTIFICATIONS
    //
    // Numai după commit.
    // NETOPIA are notificările sale în payment.service.ts.
    // ====================================================

    if (walletRefundedNow && resolvedOrder && buyerId && sellerId) {
      const currentOrderId = resolvedOrder._id.toString();

      const metadata = {
        route: "order_details",

        orderId: currentOrderId,

        status: "refunded",

        provider: "wallet",
      };

      await Promise.allSettled([
        notificationService.create({
          user: buyerId,

          type: "system",

          title: "Rambursare finalizată",

          message: "Suma comenzii a fost rambursată în soldul tău Nexora.",

          metadata,
        }),

        notificationService.create({
          user: sellerId,

          type: "sale",

          title: "Comandă rambursată",

          message:
            "Disputa a fost soluționată în favoarea cumpărătorului. Fondurile blocate pentru această vânzare au fost retrase din soldul în așteptare.",

          metadata,
        }),
      ]);
    }

    return resolvedOrder;
  } finally {
    await session.endSession();
  }
}

export async function cancelOrder(orderId: string, buyerId: string) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("ORDER_NOT_FOUND");
  }

  if (!mongoose.Types.ObjectId.isValid(buyerId)) {
    throw new Error("INVALID_BUYER");
  }

  const session = await mongoose.startSession();

  try {
    let cancelledOrder: any = null;

    await session.withTransaction(async () => {
      // ==================================================
      // ORDER
      // ==================================================

      const order = await OrderModel.findById(orderId).session(session);

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      if (order.buyer.toString() !== buyerId) {
        throw new Error("ORDER_NOT_OWNED_BY_BUYER");
      }

      // ==================================================
      // IDEMPOTENCY
      // ==================================================

      if (order.status === "cancelled") {
        cancelledOrder = order;
        return;
      }

      if (
        order.status === "refund_pending" &&
        order.refundReason === "order_cancelled"
      ) {
        cancelledOrder = order;
        return;
      }

      // ==================================================
      // ONLY BEFORE PROCESSING / SHIPPING
      // ==================================================

      if (order.status !== "paid") {
        throw new Error("ORDER_CANNOT_BE_CANCELLED");
      }

      // ==================================================
      // SELLER SALE
      // ==================================================

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

      const now = new Date();

      // ==================================================
      // CHECK NETOPIA PAYMENT
      // ==================================================

      const payment = await PaymentModel.findOne({
        order: order._id,
      }).session(session);

      // ==================================================
      // NETOPIA
      //
      // Nu scoatem încă banii vânzătorului.
      // Așteptăm confirmarea "credit".
      // ==================================================

      if (payment) {
        if (payment.status !== "paid") {
          throw new Error("PAYMENT_NOT_REFUNDABLE");
        }

        const refundAmount = Number(payment.amount);

        if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
          throw new Error("INVALID_REFUND_AMOUNT");
        }

        order.status = "refund_pending";

        order.refundReason = "order_cancelled";

        order.refundRequestedAt = now;

        order.refundCompletedAt = null;

        order.refundAmount = refundAmount;

        order.autoCompleteAt = null;

        await order.save({
          session,
        });

        cancelledOrder = order;

        return;
      }

      // ==================================================
      // WALLET PAYMENT
      // ==================================================

      const purchaseTransaction = await WalletTransaction.findOne({
        order: order._id,

        user: order.buyer,

        type: "purchase",
      }).session(session);

      if (!purchaseTransaction) {
        throw new Error("PAYMENT_SOURCE_NOT_FOUND");
      }

      if (purchaseTransaction.status !== "completed") {
        throw new Error("WALLET_PURCHASE_NOT_REFUNDABLE");
      }

      const refundAmount = Number(purchaseTransaction.amount);

      if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
        throw new Error("INVALID_REFUND_AMOUNT");
      }

      // ==================================================
      // REMOVE SELLER PENDING MONEY
      // ==================================================

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

      // ==================================================
      // REFUND BUYER WALLET
      // ==================================================

      const buyer = await User.findByIdAndUpdate(
        order.buyer,

        {
          $inc: {
            balance: refundAmount,
          },
        },

        {
          new: true,
          session,
        },
      );

      if (!buyer) {
        throw new Error("BUYER_NOT_FOUND");
      }

      // ==================================================
      // SELLER TRANSACTION
      // ==================================================

      saleTransaction.status = "rejected";

      saleTransaction.description = saleTransaction.description.replace(
        "Vânzare în așteptare:",
        "Vânzare anulată:",
      );

      saleTransaction.set("metadata.refundedAt", now);

      saleTransaction.set("metadata.refundAmount", refundAmount);

      saleTransaction.set("metadata.refundProvider", "wallet");

      saleTransaction.set("metadata.refundReason", "order_cancelled");

      await saleTransaction.save({
        session,
      });

      // ==================================================
      // BUYER REFUND TRANSACTION
      // ==================================================

      await WalletTransaction.create(
        [
          {
            user: order.buyer,

            type: "refund",

            amount: refundAmount,

            currency: purchaseTransaction.currency ?? order.currency ?? "RON",

            status: "completed",

            order: order._id,

            description: "Rambursare comandă anulată",

            metadata: {
              paymentMethod: "wallet",

              refundReason: "order_cancelled",

              originalTransactionId: purchaseTransaction._id.toString(),

              refundedAt: now,
            },
          },
        ],

        {
          session,
        },
      );

      // ==================================================
      // RELIST PRODUCT
      // ==================================================

      await ListingModel.updateOne(
        {
          _id: order.listing,

          status: "sold",
        },

        {
          $set: {
            status: "active",
          },
        },

        {
          session,
        },
      );

      // ==================================================
      // ORDER CANCELLED
      // ==================================================

      order.status = "cancelled";

      order.refundReason = "order_cancelled";

      order.refundRequestedAt = now;

      order.refundCompletedAt = now;

      order.refundAmount = refundAmount;

      order.autoCompleteAt = null;

      await order.save({
        session,
      });

      cancelledOrder = order;
    });

    return cancelledOrder;
  } finally {
    await session.endSession();
  }
}
