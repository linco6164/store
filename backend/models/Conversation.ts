import mongoose, { Document, Schema, Types } from "mongoose";

export interface IConversation extends Document {
    participants: Types.ObjectId[];

    listing?: Types.ObjectId;

    lastMessage?: string;

    lastMessageAt?: Date;

    createdAt: Date;

    updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
    {
        participants: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        ],

        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
        },

        lastMessage: {
            type: String,
            default: "",
        },

        lastMessageAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

ConversationSchema.index({
    participants: 1,
});

export default mongoose.model<IConversation>(
    "Conversation",
    ConversationSchema
);