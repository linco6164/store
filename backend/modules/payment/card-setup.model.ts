import mongoose, { Document, Schema } from "mongoose";

export type CardSetupStatus = "pending" | "completed" | "failed";

export interface CardSetupDocument extends Document {
  user: mongoose.Types.ObjectId;
  providerOrderId: string;
  platform: "android" | "web";
  returnUrl: string;
  status: CardSetupStatus;
  savedCard?: mongoose.Types.ObjectId | null;
  errorCode?: number | null;
  errorMessage?: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cardSetupSchema = new Schema<CardSetupDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },
    providerOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    platform: {
      type: String,
      enum: ["android", "web"],
      required: true,
    },
    returnUrl: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      required: true,
      index: true,
    },
    savedCard: {
      type: Schema.Types.ObjectId,
      ref: "SavedCard",
      default: null,
    },
    errorCode: {
      type: Number,
      default: null,
    },
    errorMessage: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true },
);

export const CardSetupModel = mongoose.model<CardSetupDocument>(
  "CardSetup",
  cardSetupSchema,
);

export default CardSetupModel;
