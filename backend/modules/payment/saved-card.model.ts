import mongoose, { Document, Schema } from "mongoose";

export interface SavedCardDocument extends Document {
  user: mongoose.Types.ObjectId;

  provider: "netopia";

  /**
   * Token/referință returnată de procesatorul de plăți.
   * Nu stocăm numărul complet al cardului sau CVV.
   */
  providerReference: string;

  brand: string;

  last4: string;

  expMonth?: number;

  expYear?: number;

  isDefault: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const savedCardSchema = new Schema<SavedCardDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      enum: ["netopia"],
      required: true,
      default: "netopia",
    },

    providerReference: {
      type: String,
      required: true,
      trim: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    last4: {
      type: String,
      required: true,
      match: /^\d{4}$/,
    },

    expMonth: {
      type: Number,
      min: 1,
      max: 12,
    },

    expYear: {
      type: Number,
      min: 2000,
    },

    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

savedCardSchema.index({
  user: 1,
  provider: 1,
  providerReference: 1,
});

savedCardSchema.index({
  user: 1,
  isDefault: 1,
});

const SavedCardModel = mongoose.model<SavedCardDocument>(
  "SavedCard",
  savedCardSchema,
);

export default SavedCardModel;