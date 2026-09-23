import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface ISavedCard extends Document {
  user: mongoose.Types.ObjectId;

  provider: "netopia";

  providerReference: string;

  brand: string;

  last4: string;

  expMonth?: number;

  expYear?: number;

  isDefault: boolean;

  createdAt: Date;

  updatedAt: Date;
}

const SavedCardSchema =
  new Schema<ISavedCard>(
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
        default: "netopia",
        required: true,
      },

      providerReference: {
        type: String,
        required: true,
      },

      brand: {
        type: String,
        required: true,
        trim: true,
      },

      last4: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 4,
      },

      expMonth: {
        type: Number,
        min: 1,
        max: 12,
      },

      expYear: {
        type: Number,
      },

      isDefault: {
        type: Boolean,
        default: false,
      },
    },
    {
      timestamps: true,
    },
  );

SavedCardSchema.index({
  user: 1,
  createdAt: -1,
});

SavedCardSchema.index({
  user: 1,
  providerReference: 1,
});

export const SavedCardModel =
  mongoose.model<ISavedCard>(
    "SavedCard",
    SavedCardSchema,
    "saved_cards",
  );