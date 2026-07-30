import { Server } from "socket.io";

import {
    AuthenticatedSocket,
    SendMessagePayload,
    TypingPayload,
    SeenPayload,
} from "../types/socket.js";

import onlineUsers from "./onlineUsers.js";
import chatService from "../services/chat.service.js";
import { CHAT_EVENTS } from "./events.js";
import { authenticateSocket } from "./socketAuth.js";

export default function registerChatSocket(io: Server) {
    io.on("connection", (socket: AuthenticatedSocket) => {
        console.log(`Socket connected: ${socket.id}`);

        const userId = authenticateSocket(socket);

        if (!userId) {
            socket.disconnect(true);
            return;
        }

        socket.userId = userId;

        onlineUsers.add(userId, socket.id);

        socket.broadcast.emit(
            CHAT_EVENTS.USER_ONLINE,
            userId
        );

        socket.on(
            CHAT_EVENTS.JOIN_CONVERSATION,
            (conversationId: string) => {
                socket.join(conversationId);
            }
        );

        socket.on(
            CHAT_EVENTS.LEAVE_CONVERSATION,
            (conversationId: string) => {
                socket.leave(conversationId);
            }
        );

        socket.on(
            CHAT_EVENTS.SEND_MESSAGE,
            async (data: SendMessagePayload) => {
                try {
                    if (!socket.userId) return;

                    const message =
                        await chatService.sendMessage(
                            data.conversationId,
                            socket.userId,
                            data.text,
                            data.images ?? []
                        );

                    io.to(data.conversationId).emit(
                        CHAT_EVENTS.NEW_MESSAGE,
                        message
                    );
                } catch (error) {
                    console.error(error);
                }
            }
        );

        socket.on(
            CHAT_EVENTS.TYPING,
            (data: TypingPayload) => {
                if (!socket.userId) return;

                socket.to(data.conversationId).emit(
                    CHAT_EVENTS.TYPING,
                    socket.userId
                );
            }
        );

        socket.on(
            CHAT_EVENTS.STOP_TYPING,
            (data: TypingPayload) => {
                if (!socket.userId) return;

                socket.to(data.conversationId).emit(
                    CHAT_EVENTS.STOP_TYPING,
                    socket.userId
                );
            }
        );

        socket.on(
            CHAT_EVENTS.SEEN,
            async (data: SeenPayload) => {
                if (!socket.userId) return;

                await chatService.markAsSeen(
                    data.conversationId,
                    socket.userId
                );

                io.to(data.conversationId).emit(
                    CHAT_EVENTS.MESSAGES_SEEN,
                    socket.userId
                );
            }
        );

        socket.on("disconnect", () => {
            if (socket.userId) {
                onlineUsers.remove(socket.id);

                socket.broadcast.emit(
                    CHAT_EVENTS.USER_OFFLINE,
                    socket.userId
                );
            }

            console.log(
                `Socket disconnected: ${socket.id}`
            );
        });
    });
}