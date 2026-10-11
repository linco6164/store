import mongoose from "mongoose";
import OrderModel from "./order.model.js";

import User from "../../models/Users.js";
import WalletTransaction from "../wallet/wallet.model.js";

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
    });

    return completedOrder;
  } finally {
    await session.endSession();
  }
}
