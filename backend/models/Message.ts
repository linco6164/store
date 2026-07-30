import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
    conversation: Types.ObjectId;

    sender: Types.ObjectId;

    text: string;

    images: string[];

    seenBy: Types.ObjectId[];

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
            ref: "User",
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

        seenBy: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
    }
);

MessageSchema.index({
    conversation: 1,
    createdAt: -1,
});

export default mongoose.model<IMessage>(
    "Message",
    MessageSchema
);