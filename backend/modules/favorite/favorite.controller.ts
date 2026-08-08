import { Response } from "express";

import { AuthRequest } from "../../middleware/auth.js";

import { favoriteService } from "./favorite.service.js";

type FavoriteParams = {
    listingId: string;
};

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
        req: AuthRequest<FavoriteParams>,
        res: Response
    ) {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const favorite =
                await favoriteService.isFavorite(
                    req.userId,
                    req.params.listingId
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
        req: AuthRequest<FavoriteParams>,
        res: Response
    ) {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const favorite =
                await favoriteService.addFavorite(
                    req.userId,
                    req.params.listingId
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
        req: AuthRequest<FavoriteParams>,
        res: Response
    ) {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            await favoriteService.removeFavorite(
                req.userId,
                req.params.listingId
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
        req: AuthRequest<FavoriteParams>,
        res: Response
    ) {
        try {
            if (!req.userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized",
                });
            }

            const favorite =
                await favoriteService.toggleFavorite(
                    req.userId,
                    req.params.listingId
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