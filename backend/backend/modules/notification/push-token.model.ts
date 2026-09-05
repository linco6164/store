import mongoose, {
    Document,
    Schema,
} from "mongoose";

export type PushPlatform =
    | "android"
    | "ios";

export interface PushTokenDocument
    extends Document {
    user: mongoose.Types.ObjectId;

    token: string;

    platform: PushPlatform;

    active: boolean;

    lastUsedAt: Date;

    createdAt: Date;

    updatedAt: Date;
}

const PushTokenSchema =
    new Schema<PushTokenDocument>(
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: "Store",
                required: true,
                index: true,
            },

            token: {
                type: String,
                required: true,
                unique: true,
                trim: true,
                index: true,
            },

            platform: {
                type: String,
                enum: [
                    "android",
                    "ios",
                ],
                required: true,
            },

            active: {
                type: Boolean,
                default: true,
                index: true,
            },

            lastUsedAt: {
                type: Date,
                default: Date.now,
            },
        },
        {
            timestamps: true,
        }
    );

PushTokenSchema.index({
    user: 1,
    active: 1,
});

export const PushTokenModel =
    mongoose.model<PushTokenDocument>(
        "PushToken",
        PushTokenSchema
    );