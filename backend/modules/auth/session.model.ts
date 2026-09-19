import mongoose, { Document, Schema } from "mongoose";

export interface IUserSession extends Document {
  user: mongoose.Types.ObjectId;

  sessionId: string;

  deviceName: string;

  platform: string;

  browser?: string;

  ipAddress?: string;

  userAgent?: string;

  lastActiveAt: Date;

  createdAt: Date;

  expiresAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    deviceName: {
      type: String,
      required: true,
      default: "Dispozitiv necunoscut",
    },

    platform: {
      type: String,
      required: true,
      default: "unknown",
    },

    browser: {
      type: String,
      default: "",
    },

    ipAddress: {
      type: String,
      default: "",
    },

    userAgent: {
      type: String,
      default: "",
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// MongoDB șterge automat sesiunile expirate.
UserSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

export default mongoose.model<IUserSession>(
  "UserSession",
  UserSessionSchema,
);