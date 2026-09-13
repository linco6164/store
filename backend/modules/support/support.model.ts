import mongoose, { Schema, Document, Types } from "mongoose";

export type SupportTicketStatus =
  | "open"
  | "pending"
  | "closed";

export type SupportTicketCategory =
  | "account_banned"
  | "account"
  | "payments"
  | "orders"
  | "listings"
  | "technical"
  | "other";

export interface ISupportMessage {
  _id?: Types.ObjectId;
  sender: Types.ObjectId;
  senderType: "user" | "admin";
  message: string;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  user: Types.ObjectId;
  subject: string;
  category: SupportTicketCategory;
  status: SupportTicketStatus;

  banReason?: string | null;

  messages: ISupportMessage[];

  createdAt: Date;
  updatedAt: Date;
}

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    senderType: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },
  },
  {
    timestamps: true,
    _id: true,
  },
);

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    category: {
      type: String,
      enum: [
        "account_banned",
        "account",
        "payments",
        "orders",
        "listings",
        "technical",
        "other",
      ],
      default: "other",
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "pending", "closed"],
      default: "open",
      required: true,
      index: true,
    },

    banReason: {
      type: String,
      default: null,
      maxlength: 500,
    },

    messages: {
      type: [supportMessageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

supportTicketSchema.index({
  user: 1,
  status: 1,
  updatedAt: -1,
});

export const SupportTicket =
  mongoose.model<ISupportTicket>(
    "SupportTicket",
    supportTicketSchema,
  );