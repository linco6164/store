import mongoose, {
    Document,
    Schema,
} from "mongoose";

export type NotificationType =
    | "message"
    | "favorite"
    | "offer"
    | "sale"
    | "listing"
    | "system";

export interface NotificationDocument
    extends Document {
    user: mongoose.Types.ObjectId;

    type: NotificationType;

    title: string;

    message: string;

    read: boolean;

    actor?: mongoose.Types.ObjectId;

    listing?: mongoose.Types.ObjectId;

    conversation?: mongoose.Types.ObjectId;

    metadata?: Record<string, unknown>;

    createdAt: Date;

    updatedAt: Date;
}

const NotificationSchema =
    new Schema<NotificationDocument>(
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "Store",
                required: true,
                index: true,
            },

            type: {
                type: String,
                enum: [
                    "message",
                    "favorite",
                    "offer",
                    "sale",
                    "listing",
                    "system",
                ],
                required: true,
                index: true,
            },

            title: {
                type: String,
                required: true,
                trim: true,
            },

            message: {
                type: String,
                required: true,
                trim: true,
            },

            read: {
                type: Boolean,
                default: false,
                index: true,
            },

            actor: {
                type: Schema.Types.ObjectId,
                ref: "Store",
            },

            listing: {
                type: Schema.Types.ObjectId,
                ref: "Listing",
            },

            conversation: {
                type: Schema.Types.ObjectId,
                ref: "Conversation",
            },

            metadata: {
                type: Schema.Types.Mixed,
            },
        },
        {
            timestamps: true,
        }
    );

NotificationSchema.index({
    user: 1,
    createdAt: -1,
});

NotificationSchema.index({
    user: 1,
    read: 1,
});

export const NotificationModel =
    mongoose.model<NotificationDocument>(
        "Notification",
        NotificationSchema
    );