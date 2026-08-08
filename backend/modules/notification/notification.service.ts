import mongoose from "mongoose";

import {
    NotificationDocument,
    NotificationModel,
    NotificationType,
} from "./notification.model.js";

interface CreateNotificationData {
    user: string;

    type: NotificationType;

    title: string;

    message: string;

    actor?: string;

    listing?: string;

    conversation?: string;

    metadata?: Record<string, unknown>;
}

class NotificationService {
    async create(
        data: CreateNotificationData
    ) {
        return NotificationModel.create({
            ...data,
            user: new mongoose.Types.ObjectId(
                data.user
            ),
            actor: data.actor
                ? new mongoose.Types.ObjectId(
                      data.actor
                  )
                : undefined,
            listing: data.listing
                ? new mongoose.Types.ObjectId(
                      data.listing
                  )
                : undefined,
            conversation: data.conversation
                ? new mongoose.Types.ObjectId(
                      data.conversation
                  )
                : undefined,
        });
    }

    async getAll(userId: string) {
        return NotificationModel.find({
            user: userId,
        })
            .populate(
                "actor",
                "username avatar"
            )
            .populate(
                "listing",
                "title images price"
            )
            .sort({
                createdAt: -1,
            })
            .limit(50);
    }

    async getUnreadCount(userId: string) {
        return NotificationModel.countDocuments({
            user: userId,
            read: false,
        });
    }

    async markAsRead(
        userId: string,
        notificationId: string
    ) {
        return NotificationModel.findOneAndUpdate(
            {
                _id: notificationId,
                user: userId,
            },
            {
                $set: {
                    read: true,
                },
            },
            {
                new: true,
            }
        );
    }

    async markAllAsRead(userId: string) {
        await NotificationModel.updateMany(
            {
                user: userId,
                read: false,
            },
            {
                $set: {
                    read: true,
                },
            }
        );
    }

    async delete(
        userId: string,
        notificationId: string
    ) {
        return NotificationModel.findOneAndDelete({
            _id: notificationId,
            user: userId,
        });
    }
}

export const notificationService =
    new NotificationService();