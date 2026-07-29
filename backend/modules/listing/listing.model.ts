import { Schema, model, Types } from "mongoose";

export type ListingCondition =
    | "new"
    | "like_new"
    | "good"
    | "fair";

export interface ListingDocument {
    seller: Types.ObjectId;

    title: string;

    description: string;

    category: string;

    condition: ListingCondition;

    price: number;

    city: string;

    images: string[];

    favorites: number;

    views: number;

    sold: boolean;

    createdAt: Date;

    updatedAt: Date;
}

const ListingSchema = new Schema<ListingDocument>(
    {
        seller: {
            type: Schema.Types.ObjectId,
            ref: "Store",
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 120,
        },

        description: {
            type: String,
            required: true,
            maxlength: 3000,
        },

        category: {
            type: String,
            required: true,
        },

        condition: {
            type: String,
            enum: [
                "new",
                "like_new",
                "good",
                "fair",
            ],
            required: true,
        },

        price: {
            type: Number,
            required: true,
            min: 0,
        },

        city: {
            type: String,
            required: true,
        },

        images: {
            type: [String],
            default: [],
        },

        favorites: {
            type: Number,
            default: 0,
        },

        views: {
            type: Number,
            default: 0,
        },

        sold: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

export const ListingModel = model<ListingDocument>(
    "Listing",
    ListingSchema
);