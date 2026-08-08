import axios from "axios";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL;

async function getAuthToken() {
    const SecureStore =
        await import("expo-secure-store");

    return SecureStore.getItemAsync(
        "nexora_access_token"
    );
}

async function request<T>(
    method: "get" | "post" | "delete",
    url: string
): Promise<T> {
    if (!API_URL) {
        throw new Error(
            "EXPO_PUBLIC_API_URL nu este configurat."
        );
    }

    const token =
        await getAuthToken();

    if (!token) {
        throw new Error(
            "Nu există un token de autentificare."
        );
    }

    const response =
        await axios.request<T>({
            method,
            url: `${API_URL}${url}`,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type":
                    "application/json",
            },
            timeout: 30000,
        });

    return response.data;
}

export interface NotificationActor {
    _id: string;
    username: string;
    avatar?: string;
}

export interface NotificationListing {
    _id: string;
    title: string;
    images?: string[];
    price?: number;
}

export interface NotificationItem {
    _id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;

    actor?: NotificationActor;

    listing?: NotificationListing;

    conversation?: string;

    metadata?: Record<
        string,
        unknown
    >;
}

interface NotificationsResponse {
    success: boolean;
    notifications: NotificationItem[];
}

interface UnreadCountResponse {
    success: boolean;
    count: number;
}

interface NotificationResponse {
    success: boolean;
    notification: NotificationItem;
}

interface BasicResponse {
    success: boolean;
    message?: string;
}

export const notificationService = {
    async getAll() {
        const response =
            await request<NotificationsResponse>(
                "get",
                "/notifications"
            );

        return response.notifications;
    },

    async getUnreadCount() {
        const response =
            await request<UnreadCountResponse>(
                "get",
                "/notifications/unread-count"
            );

        return response.count;
    },

    async markAsRead(
        notificationId: string
    ) {
        const response =
            await request<NotificationResponse>(
                "post",
                `/notifications/${notificationId}/read`
            );

        return response.notification;
    },

    async markAllAsRead() {
        return request<BasicResponse>(
            "post",
            "/notifications/read-all"
        );
    },

    async delete(
        notificationId: string
    ) {
        return request<BasicResponse>(
            "delete",
            `/notifications/${notificationId}`
        );
    },
};