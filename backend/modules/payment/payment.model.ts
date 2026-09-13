import mongoose, { Document, Schema } from "mongoose";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "conflict";

export interface PaymentDocument extends Document {
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId | null;

  provider: "netopia";
  providerOrderId: string;
  ntpId?: string | null;

  amount: number;
  currency: string;
  status: PaymentStatus;

  errorCode?: number | null;
  errorMessage?: string | null;
  action?: string | null;

  processedAmount?: number | null;
  rawNotification?: Record<string, unknown> | null;

  paidAt?: Date | null;
}

const paymentSchema = new Schema<PaymentDocument>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
    provider: {
      type: String,
      enum: ["netopia"],
      default: "netopia",
      required: true,
    },
    providerOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ntpId: {
      type: String,
      default: null,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    currency: {
      type: String,
      enum: ["RON", "EUR", "USD"],
      default: "RON",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "conflict"],
      default: "pending",
      required: true,
      index: true,
    },
    errorCode: {
      type: Number,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    action: {
      type: String,
      default: null,
    },
    processedAmount: {
      type: Number,
      default: null,
    },
    rawNotification: {
      type: Schema.Types.Mixed,
      default: null,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const PaymentModel = mongoose.model<PaymentDocument>(
  "Payment",
  paymentSchema,
);

export default PaymentModel;
