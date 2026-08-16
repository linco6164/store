import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    notificationService,
    type NotificationItem,
} from "@/services/notificationService";

import {
    socketService,
} from "@/services/socketService";

import {
    useAuth,
} from "@/hooks/useAuth";

type NotificationContextType = {
    notifications: NotificationItem[];
    unreadCount: number;
    loading: boolean;

    refresh: () => Promise<void>;

    refreshUnreadCount: () => Promise<void>;

    markAsRead: (
        notificationId: string
    ) => Promise<void>;

    markAllAsRead: () => Promise<void>;

    decrementUnread: () => void;

    clearUnread: () => void;

    remove: (
        notificationId: string
    ) => Promise<void>;
};

const NotificationContext =
    createContext<
        NotificationContextType | undefined
    >(undefined);

export function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    const [notifications, setNotifications] =
        useState<NotificationItem[]>([]);

    const [unreadCount, setUnreadCount] =
        useState<number>(0);

    const [loading, setLoading] =
        useState<boolean>(false);

    /**
     * Load notifications + unread count
     * from the backend.
     */
    const refresh = useCallback(
        async () => {
            if (!user) {
                setNotifications([]);
                setUnreadCount(0);
                return;
            }

            try {
                setLoading(true);

                const [
                    notificationResponse,
                    unreadResponse,
                ] = await Promise.all([
                    notificationService.getAll(),
                    notificationService.getUnreadCount(),
                ]);

                setNotifications(
                    notificationResponse
                );

                setUnreadCount(
                    unreadResponse
                );
            } catch (error) {
                console.error(
                    "Failed to refresh notifications:",
                    error
                );
            } finally {
                setLoading(false);
            }
        },
        [user]
    );

    /**
     * Refresh only unread count.
     */
    const refreshUnreadCount =
        useCallback(async () => {
            if (!user) {
                setUnreadCount(0);
                return;
            }

            try {
                const count =
                    await notificationService.getUnreadCount();

                setUnreadCount(count);
            } catch (error) {
                console.error(
                    "Failed to refresh unread count:",
                    error
                );
            }
        }, [user]);

    /**
     * Initial notification loading
     * and reload after login/logout.
     */
    useEffect(() => {
        if (!user) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        refresh();
    }, [user, refresh]);

    /**
     * Socket.IO realtime notifications.
     */
    useEffect(() => {
        if (!user) {
            return;
        }

        let mounted = true;

        let cleanup:
            | (() => void)
            | undefined;

        const setupSocket =
            async () => {
                try {
                    const socket =
                        await socketService.connect();

                    if (!mounted) {
                        return;
                    }

                    if (!socket) {
                        console.warn(
                            "Socket connection returned no socket."
                        );

                        return;
                    }

                    /**
                     * New notification received.
                     */
                    const handleNewNotification = (
                        notification: NotificationItem
                    ) => {
                        console.log(
                            "Realtime notification received:",
                            notification
                        );

                        setNotifications(
                            (current) => {
                                const exists =
                                    current.some(
                                        (item) =>
                                            item._id ===
                                            notification._id
                                    );

                                if (exists) {
                                    return current;
                                }

                                return [
                                    notification,
                                    ...current,
                                ];
                            }
                        );

                        /**
                         * Backend normally sends
                         * notification:unread-count
                         * immediately after this.
                         *
                         * We intentionally do not increment
                         * here to avoid double counting.
                         */
                    };

                    /**
                     * Backend sends the authoritative
                     * unread count.
                     */
                    const handleUnreadCount = (
                        count: number
                    ) => {
                        const normalizedCount =
                            Number.isFinite(count)
                                ? Math.max(
                                      0,
                                      count
                                  )
                                : 0;

                        setUnreadCount(
                            normalizedCount
                        );
                    };

                    socket.on(
                        "notification:new",
                        handleNewNotification
                    );

                    socket.on(
                        "notification:unread-count",
                        handleUnreadCount
                    );

                    cleanup = () => {
                        socket.off(
                            "notification:new",
                            handleNewNotification
                        );

                        socket.off(
                            "notification:unread-count",
                            handleUnreadCount
                        );
                    };
                } catch (error) {
                    console.error(
                        "Failed to connect notification socket:",
                        error
                    );
                }
            };

        setupSocket();

        return () => {
            mounted = false;

            cleanup?.();
        };
    }, [user]);

    /**
     * Mark one notification as read.
     */
    const markAsRead = useCallback(
        async (
            notificationId: string
        ) => {
            const notification =
                notifications.find(
                    (item) =>
                        item._id ===
                        notificationId
                );

            /**
             * Already read.
             */
            if (
                notification?.read
            ) {
                return;
            }

            try {
                await notificationService.markAsRead(
                    notificationId
                );

                setNotifications(
                    (current) =>
                        current.map(
                            (item) =>
                                item._id ===
                                notificationId
                                    ? {
                                          ...item,
                                          read: true,
                                      }
                                    : item
                        )
                );

                setUnreadCount(
                    (current) =>
                        Math.max(
                            0,
                            current - 1
                        )
                );
            } catch (error) {
                console.error(
                    "Failed to mark notification as read:",
                    error
                );

                throw error;
            }
        },
        [notifications]
    );

    /**
     * Mark every notification as read.
     */
    const markAllAsRead =
        useCallback(async () => {
            try {
                await notificationService.markAllAsRead();

                setNotifications(
                    (current) =>
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

    /**
     * Decrease unread count by one.
     *
     * Used by existing notifications.tsx.
     */
    const decrementUnread =
        useCallback(() => {
            setUnreadCount(
                (current) =>
                    Math.max(
                        0,
                        current - 1
                    )
            );
        }, []);

    /**
     * Clear unread count.
     *
     * Used by existing notifications.tsx.
     */
    const clearUnread =
        useCallback(() => {
            setUnreadCount(0);
        }, []);

    /**
     * Delete notification.
     */
    const remove = useCallback(
        async (
            notificationId: string
        ) => {
            const notification =
                notifications.find(
                    (item) =>
                        item._id ===
                        notificationId
                );

            try {
                await notificationService.delete(
                    notificationId
                );

                setNotifications(
                    (current) =>
                        current.filter(
                            (item) =>
                                item._id !==
                                notificationId
                        )
                );

                /**
                 * Deleting an unread notification
                 * should also decrease the badge.
                 */
                if (
                    notification &&
                    !notification.read
                ) {
                    setUnreadCount(
                        (current) =>
                            Math.max(
                                0,
                                current - 1
                            )
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to delete notification:",
                    error
                );

                throw error;
            }
        },
        [notifications]
    );

    const value =
        useMemo<NotificationContextType>(
            () => ({
                notifications,
                unreadCount,
                loading,

                refresh,

                refreshUnreadCount,

                markAsRead,

                markAllAsRead,

                decrementUnread,

                clearUnread,

                remove,
            }),
            [
                notifications,
                unreadCount,
                loading,

                refresh,

                refreshUnreadCount,

                markAsRead,

                markAllAsRead,

                decrementUnread,

                clearUnread,

                remove,
            ]
        );

    return (
        <NotificationContext.Provider
            value={value}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context =
        useContext(
            NotificationContext
        );

    if (!context) {
        throw new Error(
            "useNotifications must be used inside NotificationProvider"
        );
    }

    return context;
}