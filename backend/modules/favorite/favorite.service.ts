import { Types } from "mongoose";

import { FavoriteModel } from "./favorite.model.js";
import { ListingModel } from "../listing/listing.model.js";

export class FavoriteService {
    async getUserFavorites(userId: string) {
        return FavoriteModel.find({
            user: userId,
        })
            .populate({
                path: "listing",
                populate: {
                    path: "seller",
                    select: "username avatar",
                },
            })
            .sort({
                createdAt: -1,
            });
    }

    async isFavorite(
        userId: string,
        listingId: string
    ) {
        const favorite =
            await FavoriteModel.exists({
                user: userId,
                listing: listingId,
            });

        return Boolean(favorite);
    }

    async addFavorite(
        userId: string,
        listingId: string
    ) {
        const exists =
            await FavoriteModel.findOne({
                user: userId,
                listing: listingId,
            });

        if (exists) {
            return exists;
        }

        const favorite =
            await FavoriteModel.create({
                user: new Types.ObjectId(userId),
                listing: new Types.ObjectId(
                    listingId
                ),
            });

        await ListingModel.findByIdAndUpdate(
            listingId,
            {
                $inc: {
                    favorites: 1,
                },
            }
        );

        return favorite;
    }

    async removeFavorite(
        userId: string,
        listingId: string
    ) {
        const deleted =
            await FavoriteModel.findOneAndDelete({
                user: userId,
                listing: listingId,
            });

        if (deleted) {
            await ListingModel.findByIdAndUpdate(
                listingId,
                {
                    $inc: {
                        favorites: -1,
                    },
                }
            );
        }

        return deleted;
    }

    async toggleFavorite(
        userId: string,
        listingId: string
    ) {
        const exists =
            await FavoriteModel.findOne({
                user: userId,
                listing: listingId,
            });

        if (exists) {
            await this.removeFavorite(
                userId,
                listingId
            );

            return {
                favorite: false,
            };
        }

        await this.addFavorite(
            userId,
            listingId
        );

        return {
            favorite: true,
        };
    }
}

export const favoriteService =
    new FavoriteService();