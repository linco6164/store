import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { notificationService } from "@/services/notificationService";
import { useAuth } from "@/hooks/useAuth";

interface NotificationContextValue {
    unreadCount: number;
    refreshUnreadCount: () => Promise<void>;
    decrementUnread: () => void;
    clearUnread: () => void;
}

const NotificationContext =
    createContext<NotificationContextValue | null>(
        null
    );

export function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    const [unreadCount, setUnreadCount] =
        useState(0);

    const refreshUnreadCount =
        useCallback(async () => {
            if (!user) {
                setUnreadCount(0);
                return;
            }

            try {
                const count =
                    await notificationService.getUnreadCount();

                setUnreadCount(
                    Math.max(0, count)
                );
            } catch (error) {
                console.error(
                    "Failed to refresh notification count:",
                    error
                );
            }
        }, [user]);

    const decrementUnread =
        useCallback(() => {
            setUnreadCount(
                (current) =>
                    Math.max(0, current - 1)
            );
        }, []);

    const clearUnread =
        useCallback(() => {
            setUnreadCount(0);
        }, []);

    useEffect(() => {
        void refreshUnreadCount();
    }, [refreshUnreadCount]);

    const value = useMemo(
        () => ({
            unreadCount,
            refreshUnreadCount,
            decrementUnread,
            clearUnread,
        }),
        [
            unreadCount,
            refreshUnreadCount,
            decrementUnread,
            clearUnread,
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
        useContext(NotificationContext);

    if (!context) {
        throw new Error(
            "useNotifications must be used inside NotificationProvider"
        );
    }

    return context;
}