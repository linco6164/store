import crypto from "crypto";
import mongoose from "mongoose";

import User from "../../models/Users.js";
import { ListingModel } from "../listing/listing.model.js";
import Order from "../order/order.model.js";
import WalletTransaction from "../wallet/wallet.model.js";
import PaymentModel, { PaymentDocument } from "./payment.model.js";
import { netopiaService } from "./netopia.service.js";

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

class PaymentService {
  async createNetopiaPayment(buyerId: string, listingId: string) {
    if (!mongoose.isValidObjectId(listingId)) {
      throw new Error("INVALID_LISTING_ID");
    }

    const [buyer, listing] = await Promise.all([
      User.findById(buyerId).select(
        "email fullName username phone city county postalCode country",
      ),
      ListingModel.findOne({
        _id: listingId,
        status: "active",
      }),
    ]);

    if (!buyer) {
      throw new Error("BUYER_NOT_FOUND");
    }

    if (!listing) {
      throw new Error("LISTING_NOT_AVAILABLE");
    }

    const sellerId = listing.seller.toString();

    if (sellerId === buyerId) {
      throw new Error("CANNOT_BUY_OWN_LISTING");
    }

    const amount = Number(listing.price);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("INVALID_LISTING_PRICE");
    }

    const currency = String(listing.currency ?? "RON").toUpperCase();

    if (!["RON", "EUR", "USD"].includes(currency)) {
      throw new Error("UNSUPPORTED_CURRENCY");
    }

    const existingPayment = await PaymentModel.findOne({
      buyer: buyerId,
      listing: listingId,
      status: "pending",
    }).sort({ createdAt: -1 });

    if (existingPayment) {
      return this.getCheckoutData(existingPayment);
    }

    const providerOrderId = `NX-${Date.now()}-${crypto
      .randomBytes(6)
      .toString("hex")
      .toUpperCase()}`;

    const payment = await PaymentModel.create({
      buyer: buyerId,
      seller: sellerId,
      listing: listingId,
      provider: "netopia",
      providerOrderId,
      amount,
      currency,
      status: "pending",
    });

    try {
      return this.getCheckoutData(payment, buyer, listing);
    } catch (error) {
      await PaymentModel.findByIdAndDelete(payment._id);
      throw error;
    }
  }

  getCheckoutData(payment: PaymentDocument, buyer?: any, listing?: any) {
    const confirmUrl = String(process.env.NETOPIA_CONFIRM_URL ?? "").trim();
    const returnUrl = String(process.env.NETOPIA_RETURN_URL ?? "").trim();

    if (!confirmUrl) {
      throw new Error("Lipsește NETOPIA_CONFIRM_URL.");
    }

    if (!returnUrl) {
      throw new Error("Lipsește NETOPIA_RETURN_URL.");
    }

    const buyerFullName = normalizeName(
      buyer?.fullName,
      buyer?.username ?? "Nexora User",
    );

    const { firstName, lastName } = splitName(
      buyerFullName,
      buyer?.username ?? "User",
    );

    const details = `Nexora Store - ${listing?.title ?? "Produs"}`;

    const checkout = netopiaService.createCheckoutEnvelope({
      orderId: payment.providerOrderId,
      amount: payment.amount,
      currency: payment.currency,
      details,
      confirmUrl,
      returnUrl: `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}paymentId=${payment._id.toString()}`,
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

    return {
      paymentId: payment._id.toString(),
      orderId: payment.providerOrderId,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      checkout,
    };
  }

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

    const result = await this.applyNotification(payment, notification);

    return result;
  }

  private async applyNotification(
    payment: PaymentDocument,
    notification: ReturnType<typeof netopiaService.decryptNotification>,
  ) {
    const action = (notification.action ?? "").toLowerCase();
    const isConfirmed =
      notification.errorCode === 0 &&
      (action === "confirmed" || action === "paid");

    const isPending =
      notification.errorCode === 0 &&
      (action === "confirmed_pending" || action === "paid_pending");

    if (isPending) {
      await PaymentModel.findByIdAndUpdate(payment._id, {
        $set: {
          action: notification.action ?? null,
          ntpId: notification.ntpId ?? null,
          processedAmount: notification.processedAmount ?? null,
          errorCode: notification.errorCode,
          errorMessage: notification.errorMessage ?? null,
          rawNotification: notification.raw,
        },
      });

      return {
        paymentStatus: "pending" as const,
        message: notification.action ?? "pending",
      };
    }

    if (!isConfirmed) {
      const failedStatus =
        action === "canceled" || action === "credit" ? "cancelled" : "failed";

      await PaymentModel.findByIdAndUpdate(payment._id, {
        $set: {
          status: failedStatus,
          action: notification.action ?? null,
          ntpId: notification.ntpId ?? null,
          processedAmount: notification.processedAmount ?? null,
          errorCode: notification.errorCode,
          errorMessage: notification.errorMessage ?? null,
          rawNotification: notification.raw,
        },
      });

      return {
        paymentStatus: failedStatus,
        message:
          notification.errorMessage ?? notification.action ?? "Plata a eșuat.",
      };
    }

    const processedAmount = Number(
      notification.processedAmount ?? payment.amount,
    );

    if (!Number.isFinite(processedAmount) || processedAmount <= 0) {
      throw new Error("INVALID_PROCESSED_AMOUNT");
    }

    if (Math.abs(processedAmount - payment.amount) > 0.009) {
      await PaymentModel.findByIdAndUpdate(payment._id, {
        $set: {
          status: "conflict",
          action: notification.action ?? null,
          ntpId: notification.ntpId ?? null,
          processedAmount,
          errorCode: notification.errorCode,
          errorMessage: "Suma confirmată diferă de suma comandată.",
          rawNotification: notification.raw,
        },
      });

      throw new Error("PAYMENT_AMOUNT_MISMATCH");
    }

    const session = await mongoose.startSession();

    try {
      let orderId: string | null = null;

      await session.withTransaction(async () => {
        const lockedPayment = await PaymentModel.findOne({
          _id: payment._id,
        }).session(session);

        if (!lockedPayment) {
          throw new Error("PAYMENT_NOT_FOUND");
        }

        if (lockedPayment.status === "paid") {
          orderId = lockedPayment.order ? lockedPayment.order.toString() : null;
          return;
        }

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
            { session },
          );

          throw new Error("LISTING_ALREADY_SOLD");
        }

        if (listing.seller.toString() !== lockedPayment.seller.toString()) {
          throw new Error("SELLER_MISMATCH");
        }

        const [order] = await Order.create(
          [
            {
              buyer: lockedPayment.buyer,
              seller: lockedPayment.seller,
              listing: lockedPayment.listing,
              amount: lockedPayment.amount,
              currency: lockedPayment.currency,
              status: "paid",
            },
          ],
          { session },
        );

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
          { session },
        );

        lockedPayment.status = "paid";
        lockedPayment.order = order._id;
        lockedPayment.ntpId = notification.ntpId ?? null;
        lockedPayment.action = notification.action ?? null;
        lockedPayment.processedAmount = processedAmount;
        lockedPayment.errorCode = notification.errorCode;
        lockedPayment.errorMessage = notification.errorMessage ?? null;
        lockedPayment.rawNotification = notification.raw;
        lockedPayment.paidAt = new Date();
        await lockedPayment.save({ session });

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

  async getPayment(userId: string, paymentId: string) {
    if (!mongoose.isValidObjectId(paymentId)) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    const payment = await PaymentModel.findOne({
      _id: paymentId,
      buyer: userId,
    })
      .populate("listing", "title price currency status images")
      .populate("order", "amount currency status listing");

    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    return payment;
  }

  async getPublicPayment(paymentId: string) {
    if (!mongoose.isValidObjectId(paymentId)) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    const payment = await PaymentModel.findById(paymentId).select(
      "status amount currency providerOrderId paidAt errorCode errorMessage action",
    );

    if (!payment) {
      throw new Error("PAYMENT_NOT_FOUND");
    }

    return payment;
  }
}

export const paymentService = new PaymentService();
