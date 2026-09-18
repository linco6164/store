import mongoose, {
    Document,
    Schema,
    Types,
} from "mongoose";

export type OfferStatus =
    | "pending"
    | "accepted"
    | "rejected"
    | "countered"
    | "cancelled"
    | "expired";

export interface IOffer extends Document {
    conversation: Types.ObjectId;
    listing: Types.ObjectId;

    buyer: Types.ObjectId;
    seller: Types.ObjectId;

    amount: number;
    currency: string;

    status: OfferStatus;

    counteredFrom?: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
    {
        conversation: {
            type: Schema.Types.ObjectId,
            ref: "Conversation",
            required: true,
            index: true,
        },

        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
            index: true,
        },

        buyer: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true,
            index: true,
        },

        seller: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true,
            index: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 0.01,
        },

        currency: {
            type: String,
            default: "RON",
            uppercase: true,
            trim: true,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected",
                "countered",
                "cancelled",
                "expired",
            ],
            default: "pending",
            index: true,
        },

        counteredFrom: {
            type: Schema.Types.ObjectId,
            ref: "Offer",
        },
    },
    {
        timestamps: true,
    },
);

OfferSchema.index({
    conversation: 1,
    createdAt: -1,
});

OfferSchema.index({
    listing: 1,
    status: 1,
});

export default mongoose.model<IOffer>(
    "Offer",
    OfferSchema,
);