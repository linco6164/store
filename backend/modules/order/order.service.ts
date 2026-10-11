import mongoose from "mongoose";
import OrderModel from "./order.model.js";

import User from "../../models/Users.js";
import WalletTransaction from "../wallet/wallet.model.js";
import PaymentModel from "../payment/payment.model.js";

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

    await session.withTransaction(async () => {
      // ================================================
      // LOAD ORDER
      // ================================================

      const order = await OrderModel.findById(orderId).session(session);

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      // ================================================
      // ISSUE MUST STILL BE OPEN
      // ================================================

      if (order.status !== "issue_reported") {
        throw new Error("ORDER_HAS_NO_OPEN_ISSUE");
      }

      if (order.issueStatus !== "open") {
        throw new Error("ORDER_ISSUE_ALREADY_RESOLVED");
      }

      // ================================================
      // PAYMENT
      //
      // Refund-ul către cumpărător trebuie raportat la
      // suma plătită efectiv, nu doar la suma vânzătorului.
      // ================================================

      const payment = await PaymentModel.findOne({
        order: order._id,
      }).session(session);

      if (!payment) {
        throw new Error("PAYMENT_NOT_FOUND");
      }

      if (payment.status !== "paid") {
        throw new Error("PAYMENT_NOT_REFUNDABLE");
      }

      const refundAmount = Number(payment.amount);

      if (!Number.isFinite(refundAmount) || refundAmount <= 0) {
        throw new Error("INVALID_REFUND_AMOUNT");
      }

      // ================================================
      // SELLER MONEY MUST STILL BE HELD
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

      // ================================================
      // MARK REFUND AS PENDING
      //
      // IMPORTANT:
      // Nu modificăm încă pendingBalance.
      // Nu marcăm încă payment ca refunded/cancelled.
      // Așteptăm confirmarea reală NETOPIA.
      // ================================================

      const now = new Date();

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
