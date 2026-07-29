import { Response } from "express";

import { AuthRequest } from "../../middleware/auth.js";

import { profileService } from "./profile.service.js";

class ProfileController {
    async me(req: AuthRequest, res: Response) {
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
                message: "Failed to load profile.",
            });
        }
    }
}

export const profileController =
    new ProfileController();