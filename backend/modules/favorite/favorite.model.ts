import { Schema, model, Types } from "mongoose";

export interface FavoriteDocument {
    user: Types.ObjectId;
    listing: Types.ObjectId;

    createdAt: Date;
    updatedAt: Date;
}

const FavoriteSchema = new Schema<FavoriteDocument>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        listing: {
            type: Schema.Types.ObjectId,
            ref: "Listing",
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Un utilizator poate favoriza un anunț o singură dată
FavoriteSchema.index(
    {
        user: 1,
        listing: 1,
    },
    {
        unique: true,
    }
);

export const FavoriteModel = model<FavoriteDocument>(
    "Favorite",
    FavoriteSchema
);