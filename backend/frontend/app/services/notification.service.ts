import { api } from "@/app/lib/api";
import { ENDPOINTS } from "@/app/lib/endpoints";

export type NotificationType =
    | "message"
    | "favorite"
    | "offer"
    | "sale"
    | "listing"
    | "system";

export interface NotificationActor {
    _id: string;
    username: string;
    avatar?: string;
}

export interface NotificationListing {
    _id: string;
    title: string;
    images: string[];
    price: number;
}

export interface Notification {
    _id: string;

    type: NotificationType;

    title: string;

    message: string;

    read: boolean;

    actor?: NotificationActor;

    listing?: NotificationListing;

    conversation?: string;

    metadata?: Record<string, unknown>;

    createdAt: string;

    updatedAt: string;
}

interface NotificationsResponse {
    success: boolean;
    notifications: Notification[];
}

interface UnreadCountResponse {
    success: boolean;
    count: number;
}

interface NotificationResponse {
    success: boolean;
    notification: Notification;
}

export const notificationService = {
    async getAll(): Promise<Notification[]> {
        const { data } =
            await api.get<NotificationsResponse>(
                ENDPOINTS.NOTIFICATIONS.ALL
            );

        return data.notifications;
    },

    async getUnreadCount(): Promise<number> {
        const { data } =
            await api.get<UnreadCountResponse>(
                ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
            );

        return data.count;
    },

    async markAsRead(
        notificationId: string
    ): Promise<Notification> {
        const { data } =
            await api.patch<NotificationResponse>(
                ENDPOINTS.NOTIFICATIONS.READ(
                    notificationId
                )
            );

        return data.notification;
    },

    async markAllAsRead(): Promise<void> {
        await api.patch(
            ENDPOINTS.NOTIFICATIONS.READ_ALL
        );
    },

    async remove(
        notificationId: string
    ): Promise<void> {
        await api.delete(
            ENDPOINTS.NOTIFICATIONS.DELETE(
                notificationId
            )
        );
    },
};