import mongoose, { Document, Schema } from "mongoose";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "conflict";

export type PaymentDeliveryMethod =
  | "courier"
  | "pickup_point";

export type PaymentMethod =
  | "card"
  | "google_pay"
  | "apple_pay";

export interface PaymentDocument extends Document {
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId | null;

  // ============================================================
  // CHECKOUT
  // ============================================================

  address?: mongoose.Types.ObjectId | null;

  deliveryMethod: PaymentDeliveryMethod;

  pickupPointId?: string | null;
  pickupPointName?: string | null;
  pickupPointAddress?: string | null;

  paymentMethod: PaymentMethod;

  savedCard?: mongoose.Types.ObjectId | null;

  // ============================================================
  // PRICE
  // ============================================================

  itemPrice: number;
  buyerProtectionFee: number;
  shippingCost: number;

  /**
   * Totalul final plătit de cumpărător.
   *
   * IMPORTANT:
   * amount este calculat pe backend și nu este preluat
   * dintr-o valoare trimisă de Flutter.
   */
  amount: number;

  currency: string;

  // ============================================================
  // NETOPIA
  // ============================================================

  provider: "netopia";

  providerOrderId: string;

  ntpId?: string | null;

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

    // ==========================================================
    // CHECKOUT
    // ==========================================================

    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      default: null,
      index: true,
    },

    deliveryMethod: {
      type: String,
      enum: ["courier", "pickup_point"],
      required: true,
      default: "courier",
    },

    pickupPointId: {
      type: String,
      default: null,
    },

    pickupPointName: {
      type: String,
      default: null,
    },

    pickupPointAddress: {
      type: String,
      default: null,
    },

    paymentMethod: {
      type: String,
      enum: ["card", "google_pay", "apple_pay"],
      required: true,
      default: "card",
    },

    savedCard: {
      type: Schema.Types.ObjectId,
      ref: "SavedCard",
      default: null,
    },

    // ==========================================================
    // PRICE
    // ==========================================================

    itemPrice: {
      type: Number,
      required: true,
      min: 0.01,
    },

    buyerProtectionFee: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingCost: {
      type: Number,
      required: true,
      min: 0,
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

    // ==========================================================
    // NETOPIA
    // ==========================================================

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

    status: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "cancelled",
        "conflict",
      ],
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

// ============================================================
// INDEXES
// ============================================================

paymentSchema.index({
  buyer: 1,
  listing: 1,
  status: 1,
});

paymentSchema.index({
  seller: 1,
  status: 1,
});

paymentSchema.index({
  address: 1,
});

export const PaymentModel = mongoose.model<PaymentDocument>(
  "Payment",
  paymentSchema,
);

export default PaymentModel;