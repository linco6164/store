import mongoose, { Document, Schema } from "mongoose";

export interface IPromotion extends Document {
  user: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;

  type: "boost";

  duration: 24 | 72 | 168;

  amount: number;
  currency: string;

  payment?: mongoose.Types.ObjectId;

  status: "pending" | "active" | "expired" | "cancelled";

  startsAt?: Date;
  expiresAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PromotionSchema = new Schema<IPromotion>(
  {
    user: {
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

    type: {
      type: String,
      enum: ["boost"],
      default: "boost",
      required: true,
    },

    duration: {
      type: Number,
      enum: [24, 72, 168],
      required: true,
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

    payment: {
      type: Schema.Types.ObjectId,
      ref: "PromotionPayment",
    },

    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled"],
      default: "pending",
      index: true,
    },

    startsAt: {
      type: Date,
    },

    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

PromotionSchema.index({
  listing: 1,
  status: 1,
});

PromotionSchema.index({
  user: 1,
  createdAt: -1,
});

export const PromotionModel = mongoose.model<IPromotion>(
  "Promotion",
  PromotionSchema,
  "promotions",
);
