import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IPromotionPayment
  extends Document {
  user: mongoose.Types.ObjectId;
  promotion: mongoose.Types.ObjectId;

  provider: "netopia";

  providerOrderId: string;

  amount: number;
  currency: string;

  status:
    | "pending"
    | "paid"
    | "failed"
    | "cancelled";

  ntpId?: string;
  action?: string;

  processedAmount?: number;

  errorCode?: string;
  errorMessage?: string;

  rawNotification?: unknown;

  paidAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PromotionPaymentSchema =
  new Schema<IPromotionPayment>(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "Store",
        required: true,
        index: true,
      },

      promotion: {
        type: Schema.Types.ObjectId,
        ref: "Promotion",
        required: true,
        index: true,
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

      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      currency: {
        type: String,
        default: "RON",
      },

      status: {
        type: String,
        enum: [
          "pending",
          "paid",
          "failed",
          "cancelled",
        ],
        default: "pending",
        index: true,
      },

      ntpId: {
        type: String,
      },

      action: {
        type: String,
      },

      processedAmount: {
        type: Number,
      },

      errorCode: {
        type: String,
      },

      errorMessage: {
        type: String,
      },

      rawNotification: {
        type: Schema.Types.Mixed,
      },

      paidAt: {
        type: Date,
      },
    },
    {
      timestamps: true,
    },
  );

export const PromotionPaymentModel =
  mongoose.model<IPromotionPayment>(
    "PromotionPayment",
    PromotionPaymentSchema,
    "promotion_payments",
  );