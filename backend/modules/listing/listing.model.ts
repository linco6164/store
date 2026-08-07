import { Schema, model, Types } from "mongoose";

export type ListingCondition =
    | "new"
    | "like_new"
    | "good"
    | "fair";

export type ListingStatus =
    | "active"
    | "reserved"
    | "sold"
    | "hidden";

export interface ListingDocument {
    seller: Types.ObjectId;

    title: string;
    description: string;

    category: string;
    subcategory?: string;

    condition: ListingCondition;

    price: number;
    currency: "RON";

    negotiable: boolean;

    city: string;

    images: string[];

    brand?: string;
    color?: string;
    size?: string;

    shipping: boolean;

    favorites: number;
    views: number;

    status: ListingStatus;

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
            trim: true,
        },

        subcategory: {
            type: String,
            default: null,
            trim: true,
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

        currency: {
            type: String,
            enum: ["RON"],
            default: "RON",
        },

        negotiable: {
            type: Boolean,
            default: false,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        images: {
            type: [String],
            default: [],
        },

        brand: {
            type: String,
            default: null,
            trim: true,
        },

        color: {
            type: String,
            default: null,
            trim: true,
        },

        size: {
            type: String,
            default: null,
            trim: true,
        },

        shipping: {
            type: Boolean,
            default: true,
        },

        favorites: {
            type: Number,
            default: 0,
            min: 0,
        },

        views: {
            type: Number,
            default: 0,
            min: 0,
        },

        status: {
            type: String,
            enum: [
                "active",
                "reserved",
                "sold",
                "hidden",
            ],
            default: "active",
        },
    },
    {
        timestamps: true,
    }
);

ListingSchema.index({
    title: "text",
    description: "text",
});

ListingSchema.index({
    category: 1,
});

ListingSchema.index({
    city: 1,
});

ListingSchema.index({
    seller: 1,
});

ListingSchema.index({
    createdAt: -1,
});

ListingSchema.index({
    price: 1,
});

ListingSchema.index({
    favorites: -1,
});

ListingSchema.index({
    views: -1,
});

export const ListingModel = model<ListingDocument>(
    "Listing",
    ListingSchema
);