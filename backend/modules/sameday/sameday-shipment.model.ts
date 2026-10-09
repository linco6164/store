import mongoose, {
  Document,
  Schema,
} from "mongoose";

export type SamedayShipmentStatus =
  | "pending"
  | "awb_created"
  | "ready_for_dropoff"
  | "dropped_off"
  | "in_transit"
  | "at_locker"
  | "delivered"
  | "returned"
  | "cancelled"
  | "failed";

export interface SamedayShipmentDocument
  extends Document {
  order: mongoose.Types.ObjectId;

  buyer: mongoose.Types.ObjectId;

  seller: mongoose.Types.ObjectId;

  provider: "sameday";

  serviceId: number;

  clientInternalReference: string;

  // ============================================================
  // SAMEDAY ACCOUNT
  // ============================================================

  pickupPointId?: number | null;

  contactPersonId?: number | null;

  // ============================================================
  // BUYER EASYBOX
  // ============================================================

  oohLastMile: number;

  destinationLockerName?: string | null;

  destinationLockerAddress?: string | null;

  destinationLockerCity?: string | null;

  destinationLockerCounty?: string | null;

  destinationLockerLat?: number | null;

  destinationLockerLng?: number | null;

  // ============================================================
  // PACKAGE
  // ============================================================

  packageType: 0 | 1 | 2;

  packageNumber: number;

  packageWeight: number;

  width?: number | null;

  length?: number | null;

  height?: number | null;

  // ============================================================
  // PDO
  // ============================================================

  pdoEnabled: boolean;

  pdoTaxId?: number | null;

  // ============================================================
  // AWB
  // ============================================================

  awbNumber?: string | null;

  awbCost?: number | null;

  pdfLink?: string | null;

  parcelAwbNumbers: string[];

  // ============================================================
  // LABEL-FREE
  //
  // Le păstrăm pentru cazul în care Sameday ne activează
  // ulterior un flux QR/PIN fără AWB printat.
  // Documentația Client API actuală NU definește aceste câmpuri.
  // ============================================================

  labelFree: boolean;

  dropoffCode?: string | null;

  dropoffQr?: string | null;

  dropoffExpiresAt?: Date | null;

  // ============================================================
  // STATUS
  // ============================================================

  status: SamedayShipmentStatus;

  samedayStatus?: string | null;

  errorMessage?: string | null;

  rawResponse?: Record<
    string,
    unknown
  > | null;

  createdAt: Date;

  updatedAt: Date;
}

const samedayShipmentSchema =
  new Schema<SamedayShipmentDocument>(
    {
      order: {
        type:
          Schema.Types.ObjectId,

        ref: "Order",

        required: true,

        unique: true,

        index: true,
      },

      buyer: {
        type:
          Schema.Types.ObjectId,

        ref: "Store",

        required: true,

        index: true,
      },

      seller: {
        type:
          Schema.Types.ObjectId,

        ref: "Store",

        required: true,

        index: true,
      },

      provider: {
        type: String,

        enum: [
          "sameday",
        ],

        default:
          "sameday",

        required: true,
      },

      serviceId: {
        type: Number,

        required: true,

        default: 15,

        index: true,
      },

      clientInternalReference: {
        type: String,

        required: true,

        unique: true,

        index: true,

        trim: true,
      },

      // ========================================================
      // SAMEDAY ACCOUNT
      // ========================================================

      pickupPointId: {
        type: Number,

        default: null,
      },

      contactPersonId: {
        type: Number,

        default: null,
      },

      // ========================================================
      // BUYER EASYBOX
      // ========================================================

      oohLastMile: {
        type: Number,

        required: true,

        index: true,
      },

      destinationLockerName: {
        type: String,

        default: null,
      },

      destinationLockerAddress: {
        type: String,

        default: null,
      },

      destinationLockerCity: {
        type: String,

        default: null,
      },

      destinationLockerCounty: {
        type: String,

        default: null,
      },

      destinationLockerLat: {
        type: Number,

        default: null,
      },

      destinationLockerLng: {
        type: Number,

        default: null,
      },

      // ========================================================
      // PACKAGE
      // ========================================================

      packageType: {
        type: Number,

        enum: [
          0,
          1,
          2,
        ],

        default: 0,

        required: true,
      },

      packageNumber: {
        type: Number,

        default: 1,

        min: 1,

        required: true,
      },

      packageWeight: {
        type: Number,

        required: true,

        min: 0.01,
      },

      width: {
        type: Number,

        default: null,

        min: 0,
      },

      length: {
        type: Number,

        default: null,

        min: 0,
      },

      height: {
        type: Number,

        default: null,

        min: 0,
      },

      // ========================================================
      // PDO
      // ========================================================

      pdoEnabled: {
        type: Boolean,

        default: true,
      },

      pdoTaxId: {
        type: Number,

        default: null,
      },

      // ========================================================
      // AWB
      // ========================================================

      awbNumber: {
        type: String,

        default: null,

        index: true,
      },

      awbCost: {
        type: Number,

        default: null,

        min: 0,
      },

      pdfLink: {
        type: String,

        default: null,
      },

      parcelAwbNumbers: {
        type: [
          String,
        ],

        default: [],
      },

      // ========================================================
      // LABEL-FREE
      // ========================================================

      labelFree: {
        type: Boolean,

        default: false,
      },

      dropoffCode: {
        type: String,

        default: null,
      },

      dropoffQr: {
        type: String,

        default: null,
      },

      dropoffExpiresAt: {
        type: Date,

        default: null,
      },

      // ========================================================
      // STATUS
      // ========================================================

      status: {
        type: String,

        enum: [
          "pending",
          "awb_created",
          "ready_for_dropoff",
          "dropped_off",
          "in_transit",
          "at_locker",
          "delivered",
          "returned",
          "cancelled",
          "failed",
        ],

        default:
          "pending",

        required: true,

        index: true,
      },

      samedayStatus: {
        type: String,

        default: null,
      },

      errorMessage: {
        type: String,

        default: null,
      },

      rawResponse: {
        type:
          Schema.Types.Mixed,

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

samedayShipmentSchema.index({
  buyer: 1,
  status: 1,
});

samedayShipmentSchema.index({
  seller: 1,
  status: 1,
});

samedayShipmentSchema.index({
  awbNumber: 1,
});

samedayShipmentSchema.index({
  oohLastMile: 1,
});

const SamedayShipmentModel =
  mongoose.model<SamedayShipmentDocument>(
    "SamedayShipment",
    samedayShipmentSchema,
    "sameday_shipments",
  );

export default SamedayShipmentModel;