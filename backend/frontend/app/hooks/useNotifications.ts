"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    notificationService,
    Notification,
} from "@/app/services/notification.service";

interface UseNotificationsResult {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: boolean;
    reload: () => Promise<void>;
    markAsRead: (
        notificationId: string
    ) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    remove: (
        notificationId: string
    ) => Promise<void>;
}

export function useNotifications(): UseNotificationsResult {
    const [notifications, setNotifications] =
        useState<Notification[]>([]);

    const [unreadCount, setUnreadCount] =
        useState(0);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(false);

    const loadNotifications =
        useCallback(async () => {
            try {
                setLoading(true);
                setError(false);

                const [
                    notificationsData,
                    unreadCountData,
                ] = await Promise.all([
                    notificationService.getAll(),
                    notificationService.getUnreadCount(),
                ]);

                setNotifications(
                    notificationsData
                );

                setUnreadCount(
                    unreadCountData
                );
            } catch (error) {
                console.error(
                    "Failed to load notifications:",
                    error
                );

                setNotifications([]);
                setUnreadCount(0);
                setError(true);
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        void loadNotifications();

        function handleNotificationsChanged() {
            void loadNotifications();
        }

        window.addEventListener(
            "notifications:changed",
            handleNotificationsChanged
        );

        return () => {
            window.removeEventListener(
                "notifications:changed",
                handleNotificationsChanged
            );
        };
    }, [loadNotifications]);

    const markAsRead = useCallback(
        async (notificationId: string) => {
            try {
                await notificationService.markAsRead(
                    notificationId
                );

                setNotifications((current) =>
                    current.map((notification) =>
                        notification._id ===
                        notificationId
                            ? {
                                  ...notification,
                                  read: true,
                              }
                            : notification
                    )
                );

                setUnreadCount((current) =>
                    Math.max(0, current - 1)
                );
            } catch (error) {
                console.error(
                    "Failed to mark notification as read:",
                    error
                );

                throw error;
            }
        },
        []
    );

    const markAllAsRead =
        useCallback(async () => {
            try {
                await notificationService.markAllAsRead();

                setNotifications((current) =>
                    current.map(
                        (notification) => ({
                            ...notification,
                            read: true,
                        })
                    )
                );

                setUnreadCount(0);
            } catch (error) {
                console.error(
                    "Failed to mark all notifications as read:",
                    error
                );

                throw error;
            }
        }, []);

    const remove = useCallback(
        async (notificationId: string) => {
            try {
                await notificationService.remove(
                    notificationId
                );

                setNotifications((current) =>
                    current.filter(
                        (notification) =>
                            notification._id !==
                            notificationId
                    )
                );
            } catch (error) {
                console.error(
                    "Failed to delete notification:",
                    error
                );

                throw error;
            }
        },
        []
    );

    return {
        notifications,
        unreadCount,
        loading,
        error,
        reload: loadNotifications,
        markAsRead,
        markAllAsRead,
        remove,
    };
}