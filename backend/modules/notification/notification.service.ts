import mongoose from "mongoose";

import {
    NotificationDocument,
    NotificationModel,
    NotificationType,
} from "./notification.model.js";

import {
    PushTokenModel,
    PushPlatform,
} from "./push-token.model.js";

import {
    pushNotificationService,
} from "./push-notification.service.js";

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
        const notification =
            await NotificationModel.create({
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

        try {
            const unreadCount =
                await NotificationModel.countDocuments({
                    user: data.user,
                    read: false,
                });

            await pushNotificationService.sendToUser(
                data.user,
                {
                    title: data.title,
                    body: data.message,

                    badge: unreadCount,

                    data: {
                        notificationId:
                            notification._id.toString(),

                        type: data.type,

                        ...(data.listing
                            ? {
                                listingId:
                                    data.listing,
                            }
                            : {}),

                        ...(data.conversation
                            ? {
                                conversationId:
                                    data.conversation,
                            }
                            : {}),
                    },
                }
            );
        } catch (error) {
            /*
             * Push-ul nu trebuie să facă
             * eșueze crearea notificării.
             */
            console.error(
                "Failed to send push notification:",
                error
            );
        }

        return notification;
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

    async registerPushToken(
        userId: string,
        token: string,
        platform: PushPlatform
    ) {
        const userObjectId =
            new mongoose.Types.ObjectId(
                userId
            );

        return PushTokenModel.findOneAndUpdate(
            {
                token,
            },
            {
                $set: {
                    user: userObjectId,
                    platform,
                    active: true,
                    lastUsedAt: new Date(),
                },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );
    }

    async removePushToken(
        userId: string,
        token: string
    ) {
        return PushTokenModel.findOneAndUpdate(
            {
                user: userId,
                token,
            },
            {
                $set: {
                    active: false,
                },
            },
            {
                new: true,
            }
        );
    }
}

export const notificationService =
    new NotificationService();