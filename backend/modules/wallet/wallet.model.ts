import mongoose from "mongoose";

const WalletTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["purchase", "withdrawal", "refund", "fee"],
      required: true,
    },

    withdrawal: {
      iban: {
        type: String,
        default: null,
      },

      accountName: {
        type: String,
        default: null,
      },
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
      enum: ["pending", "completed", "failed", "rejected"],
      default: "pending",
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    description: {
      type: String,
      default: "",
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model(
  "WalletTransaction",
  WalletTransactionSchema,
  "wallet_transactions",
);
