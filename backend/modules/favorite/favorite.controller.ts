import { Response } from "express";

import { AuthRequest } from "../../middleware/auth.js";
import { favoriteService } from "./favorite.service.js";

function getListingId(
    req: AuthRequest
): string | null {
    const { listingId } = req.params;

    if (typeof listingId !== "string") {
        return null;
    }

    return listingId;
}

class FavoriteController {
    async getFavorites(
        req: AuthRequest,
        res: Response
    ) {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const favorites =
                await favoriteService.getUserFavorites(
                    req.userId
                );

            return res.json({
                success: true,
                data: favorites,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to load favorites.",
            });
        }
    }

    async checkFavorite(
        req: AuthRequest,
        res: Response
    ) {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const listingId =
                getListingId(req);

            if (!listingId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid listing ID.",
                });
            }

            const favorite =
                await favoriteService.isFavorite(
                    req.userId,
                    listingId
                );

            return res.json({
                success: true,
                data: favorite,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to check favorite.",
            });
        }
    }

    async addFavorite(
        req: AuthRequest,
        res: Response
    ) {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const listingId =
                getListingId(req);

            if (!listingId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid listing ID.",
                });
            }

            const favorite =
                await favoriteService.addFavorite(
                    req.userId,
                    listingId
                );

            return res.status(201).json({
                success: true,
                data: favorite,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to add favorite.",
            });
        }
    }

    async removeFavorite(
        req: AuthRequest,
        res: Response
    ) {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const listingId =
                getListingId(req);

            if (!listingId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid listing ID.",
                });
            }

            await favoriteService.removeFavorite(
                req.userId,
                listingId
            );

            return res.json({
                success: true,
                message:
                    "Favorite removed.",
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to remove favorite.",
            });
        }
    }

    async toggleFavorite(
        req: AuthRequest,
        res: Response
    ) {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const listingId =
                getListingId(req);

            if (!listingId) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid listing ID.",
                });
            }

            const favorite =
                await favoriteService.toggleFavorite(
                    req.userId,
                    listingId
                );

            return res.json({
                success: true,
                data: favorite,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to update favorite.",
            });
        }
    }
}

export const favoriteController =
    new FavoriteController();