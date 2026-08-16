import mongoose from "mongoose";

import {
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

import {
    getSocketIO,
} from "../../sockets/socket.io.js";

import {
    emitNewNotification,
} from "../../sockets/notification.socket.js";

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
    private toObjectId(userId: string) {
        if (
            !mongoose.Types.ObjectId.isValid(
                userId
            )
        ) {
            throw new Error(
                `Invalid userId: ${userId}`
            );
        }

        return new mongoose.Types.ObjectId(
            userId
        );
    }

    async create(
        data: CreateNotificationData
    ) {
        const notification =
            await NotificationModel.create({
                ...data,

                user: this.toObjectId(
                    data.user
                ),

                actor: data.actor
                    ? this.toObjectId(
                          data.actor
                      )
                    : undefined,

                listing: data.listing
                    ? this.toObjectId(
                          data.listing
                      )
                    : undefined,

                conversation:
                    data.conversation
                        ? this.toObjectId(
                              data.conversation
                          )
                        : undefined,
            });

        try {
            const unreadCount =
                await NotificationModel.countDocuments(
                    {
                        user: this.toObjectId(
                            data.user
                        ),
                        read: false,
                    }
                );

            try {
                const io = getSocketIO();

                emitNewNotification(
                    io,
                    data.user,
                    notification,
                    unreadCount
                );
            } catch (error) {
                console.error(
                    "Failed to emit socket notification:",
                    error
                );
            }

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
            console.error(
                "Failed to send notification side effects:",
                error
            );
        }

        return notification;
    }

    async getAll(userId: string) {
        try {
            const userObjectId =
                this.toObjectId(userId);

            console.log(
                "[NotificationService] getAll:",
                userObjectId.toString()
            );

            const notifications =
                await NotificationModel.find({
                    user: userObjectId,
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
                    .limit(50)
                    .lean();

            console.log(
                "[NotificationService] getAll result:",
                notifications.length
            );

            return notifications;
        } catch (error) {
            console.error(
                "[NotificationService] getAll ERROR:",
                error
            );

            throw error;
        }
    }

    async getUnreadCount(
        userId: string
    ) {
        try {
            const userObjectId =
                this.toObjectId(userId);

            console.log(
                "[NotificationService] getUnreadCount:",
                userObjectId.toString()
            );

            const count =
                await NotificationModel.countDocuments(
                    {
                        user: userObjectId,
                        read: false,
                    }
                );

            console.log(
                "[NotificationService] unreadCount:",
                count
            );

            return count;
        } catch (error) {
            console.error(
                "[NotificationService] getUnreadCount ERROR:",
                error
            );

            throw error;
        }
    }

    async markAsRead(
        userId: string,
        notificationId: string
    ) {
        return NotificationModel.findOneAndUpdate(
            {
                _id: notificationId,
                user: this.toObjectId(
                    userId
                ),
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

    async markAllAsRead(
        userId: string
    ) {
        await NotificationModel.updateMany(
            {
                user: this.toObjectId(
                    userId
                ),
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
        return NotificationModel.findOneAndDelete(
            {
                _id: notificationId,
                user: this.toObjectId(
                    userId
                ),
            }
        );
    }

    async registerPushToken(
        userId: string,
        token: string,
        platform: PushPlatform
    ) {
        const userObjectId =
            this.toObjectId(userId);

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
                user:
                    this.toObjectId(userId),
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