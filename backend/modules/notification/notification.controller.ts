import { Response } from "express";

import { AuthRequest } from "../../middleware/auth.js";

import {
    notificationService,
} from "./notification.service.js";

class NotificationController {
    async getAll(
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

            const notifications =
                await notificationService.getAll(
                    req.userId
                );

            return res.json({
                success: true,
                notifications,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to load notifications.",
            });
        }
    }

    async unreadCount(
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

            const count =
                await notificationService.getUnreadCount(
                    req.userId
                );

            return res.json({
                success: true,
                count,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to load unread count.",
            });
        }
    }

    async markAsRead(
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

            const notificationId =
                Array.isArray(req.params.id)
                    ? req.params.id[0]
                    : req.params.id;

            const notification =
                await notificationService.markAsRead(
                    req.userId,
                    notificationId
                );

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Notification not found.",
                });
            }

            return res.json({
                success: true,
                notification,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to mark notification as read.",
            });
        }
    }

    async markAllAsRead(
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

            await notificationService.markAllAsRead(
                req.userId
            );

            return res.json({
                success: true,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to mark notifications as read.",
            });
        }
    }

    async remove(
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

            const notificationId =
                Array.isArray(req.params.id)
                    ? req.params.id[0]
                    : req.params.id;

            const notification =
                await notificationService.delete(
                    req.userId,
                    notificationId
                );

            if (!notification) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Notification not found.",
                });
            }

            return res.json({
                success: true,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message:
                    "Failed to delete notification.",
            });
        }
    }
}

export const notificationController =
    new NotificationController();