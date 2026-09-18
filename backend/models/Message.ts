import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  conversation: Types.ObjectId;

  sender: Types.ObjectId;

  text: string;

  images: string[];

  replyTo?: Types.ObjectId;

  type?: "text" | "offer";

  offer?: Types.ObjectId;

  deliveredTo: Types.ObjectId[];

  seenBy: Types.ObjectId[];

  deletedFor: Types.ObjectId[];

  isDeleted: boolean;

  deletedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    text: {
      type: String,
      trim: true,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },

    type: {
      type: String,
      enum: ["text", "offer"],
      default: "text",
    },

    offer: {
      type: Schema.Types.ObjectId,
      ref: "Offer",
    },

    deliveredTo: [
      {
        type: Schema.Types.ObjectId,
        ref: "Store",
      },
    ],

    seenBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "Store",
      },
    ],

    deletedFor: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

MessageSchema.index({
  conversation: 1,
  createdAt: -1,
});

export default mongoose.model<IMessage>("Message", MessageSchema);
