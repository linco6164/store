import { Server } from "socket.io";

export const NOTIFICATION_EVENTS = {
    NEW_NOTIFICATION: "notification:new",
    UNREAD_COUNT: "notification:unread-count",
} as const;

export function emitNewNotification(
    io: Server,
    userId: string,
    notification: unknown,
    unreadCount: number
) {
    io.to(`user:${userId}`).emit(
        NOTIFICATION_EVENTS.NEW_NOTIFICATION,
        notification
    );

    io.to(`user:${userId}`).emit(
        NOTIFICATION_EVENTS.UNREAD_COUNT,
        unreadCount
    );
}