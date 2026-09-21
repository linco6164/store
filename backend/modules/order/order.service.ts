import mongoose from "mongoose";
import OrderModel from "./order.model.js";

export async function getBuyerOrders(userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("ID-ul utilizatorului este invalid.");
  }

  return OrderModel.find({
    buyer: userId,
  })
    .populate("seller", "username avatar fullName")
    .populate(
      "listing",
      "title images price currency status",
    )
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
    .populate(
      "listing",
      "title images price currency status",
    )
    .sort({ createdAt: -1 });
}

export async function getOrderById(
  orderId: string,
  userId: string,
) {
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("ID-ul comenzii este invalid.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("ID-ul utilizatorului este invalid.");
  }

  const order = await OrderModel.findOne({
    _id: orderId,
    $or: [
      { buyer: userId },
      { seller: userId },
    ],
  })
    .populate("buyer", "username avatar fullName")
    .populate("seller", "username avatar fullName")
    .populate(
      "listing",
      "title images price currency status",
    );

  if (!order) {
    throw new Error("Comanda nu există.");
  }

  return order;
}

export async function getCompletedBuyerOrders(
  userId: string,
) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("ID-ul utilizatorului este invalid.");
  }

  return OrderModel.find({
    buyer: userId,
    status: "completed",
  })
    .populate("seller", "username avatar fullName")
    .populate(
      "listing",
      "title images price currency status",
    )
    .sort({ createdAt: -1 });
}