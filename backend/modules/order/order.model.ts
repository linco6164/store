import mongoose, { Schema } from "mongoose";

// ============================================================
// ORDER SCHEMA
// ============================================================

const OrderSchema = new mongoose.Schema(
  {
    // ======================================================
    // USERS
    // ======================================================

    buyer: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Store",

      required: true,

      index: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Store",

      required: true,

      index: true,
    },

    // ======================================================
    // LISTING
    // ======================================================

    listing: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Listing",

      required: true,

      unique: true,
    },

    // ======================================================
    // DELIVERY ADDRESS
    // ======================================================

    /**
     * Adresa selectată de cumpărător la checkout.
     *
     * Pentru curier:
     * aceasta este adresa de livrare.
     *
     * Pentru Easybox:
     * o păstrăm ca adresă a cumpărătorului,
     * chiar dacă livrarea efectivă se face la locker.
     */
    address: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Address",

      default: null,

      index: true,
    },

    // ======================================================
    // DELIVERY METHOD
    // ======================================================

    deliveryMethod: {
      type: String,

      enum: ["courier", "pickup_point"],

      default: "courier",

      required: true,

      index: true,
    },

    // ======================================================
    // SAMEDAY EASYBOX
    // ======================================================

    /**
     * ID-ul OOH real returnat de Sameday.
     *
     * Acesta va deveni:
     *
     * oohLastMile
     *
     * când generăm AWB-ul.
     */
    destinationLockerId: {
      type: Number,

      default: null,

      min: 1,

      index: true,
    },

    /**
     * ID-ul locației salvat ca string,
     * util pentru afișare / compatibilitate.
     */
    pickupPointId: {
      type: String,

      default: null,
    },

    /**
     * Numele Easybox-ului verificat
     * pe backend prin API-ul Sameday.
     */
    pickupPointName: {
      type: String,

      default: null,

      trim: true,
    },

    /**
     * Adresa Easybox-ului verificată
     * pe backend prin API-ul Sameday.
     */
    pickupPointAddress: {
      type: String,

      default: null,

      trim: true,
    },

    // ======================================================
    // PRICE
    // ======================================================

    amount: {
      type: Number,

      required: true,

      min: 0,
    },

    currency: {
      type: String,

      enum: ["RON", "EUR", "USD"],

      default: "RON",
    },

    // ======================================================
    // STATUS
    // ======================================================

    status: {
      type: String,

      enum: [
        "paid",
        "processing",
        "shipped",
        "delivered",
        "issue_reported",
        "refund_pending",
        "completed",
        "cancelled",
        "refunded",
      ],

      default: "paid",

      index: true,
    },

    // ======================================================
    // ORDER COMPLETION
    // ======================================================

    deliveredAt: {
      type: Date,
      default: null,
    },

    buyerConfirmedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    autoCompleteAt: {
      type: Date,
      default: null,
    },

    completionReason: {
      type: String,

      enum: ["buyer_confirmed", "auto_completed"],

      default: null,
    },

    // ======================================================
    // BUYER ISSUE / DISPUTE
    // ======================================================

    issueReportedAt: {
      type: Date,
      default: null,
    },

    issueReason: {
      type: String,

      enum: [
        "item_not_as_described",
        "damaged",
        "wrong_item",
        "missing_item",
        "counterfeit",
        "other",
      ],

      default: null,
    },

    issueDetails: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },

    issueStatus: {
      type: String,

      enum: ["open", "resolved", "rejected"],

      default: null,
    },

    issueResolvedAt: {
      type: Date,
      default: null,
    },

    issueResolution: {
      type: String,
      enum: ["buyer_refund", "seller_release"],
      default: null,
    },

    issueResolutionNote: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },

    issueResolvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      default: null,
    },

    refundRequestedAt: {
      type: Date,
      default: null,
    },

    refundCompletedAt: {
      type: Date,
      default: null,
    },

    refundAmount: {
      type: Number,
      default: null,
      min: 0,
    },

    refundReason: {
      type: String,

      enum: ["buyer_issue", "order_cancelled"],

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

OrderSchema.index({
  buyer: 1,

  status: 1,

  createdAt: -1,
});

OrderSchema.index({
  seller: 1,

  status: 1,

  createdAt: -1,
});

OrderSchema.index({
  deliveryMethod: 1,

  status: 1,
});

// ============================================================
// MODEL
// ============================================================

export default mongoose.model(
  "Order",

  OrderSchema,

  "orders",
);
