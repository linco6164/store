import {
    Request,
    Response,
} from "express";

import { AuthRequest } from "../../middleware/auth.js";

import { profileService } from "./profile.service.js";

class ProfileController {
    async me(
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

            const profile =
                await profileService.getProfile(
                    req.userId
                );

            return res.json({
                success: true,
                data: profile,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to load profile.",
            });
        }
    }

    async update(
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

            const profile =
                await profileService.updateProfile(
                    req.userId,
                    req.body
                );

            return res.json({
                success: true,
                data: profile,
            });
        } catch (error) {
            if (
                error instanceof Error &&
                error.message ===
                    "USERNAME_TAKEN"
            ) {
                return res.status(409).json({
                    success: false,
                    message:
                        "Numele de utilizator este deja folosit.",
                });
            }

            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to update profile.",
            });
        }
    }

    async publicProfile(
        req: Request,
        res: Response
    ) {
        try {
            const { id } = req.params;

            if (typeof id !== "string") {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid user ID.",
                });
            }

            const profile =
                await profileService.getPublicProfile(
                    id
                );

            return res.json({
                success: true,
                data: profile,
            });
        } catch (error) {
            if (
                error instanceof Error &&
                error.message ===
                    "USER_NOT_FOUND"
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "User not found.",
                });
            }

            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to load public profile.",
            });
        }
    }
}

export const profileController =
    new ProfileController();