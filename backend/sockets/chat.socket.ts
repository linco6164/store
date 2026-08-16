import { Server } from "socket.io";

import {
    AuthenticatedSocket,
    TypingPayload,
    SeenPayload,
} from "../types/socket.js";

import onlineUsers from "./onlineUsers.js";
import chatService from "../services/chat.service.js";
import { CHAT_EVENTS } from "./events.js";

export default function registerChatSocket(io: Server) {
    io.on("connection", (socket: AuthenticatedSocket) => {
        console.log("Socket connected:", socket.id);
        console.log("User:", socket.userId);

        if (!socket.userId) {
            socket.disconnect(true);
            return;
        }

        onlineUsers.add(socket.userId, socket.id);

        io.emit(
            CHAT_EVENTS.ONLINE_USERS,
            onlineUsers.getAll()
        );

        socket.broadcast.emit(
            CHAT_EVENTS.USER_ONLINE,
            socket.userId
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
            async (data: {
                conversationId: string;
                text: string;
                images?: string[];
                replyTo?: string;
            }) => {
                try {
                    const message =
                        await chatService.sendMessage(
                            data.conversationId,
                            socket.userId!,
                            data.text,
                            data.images ?? [],
                            data.replyTo
                        );

                    io.to(data.conversationId).emit(
                        CHAT_EVENTS.NEW_MESSAGE,
                        message
                    );

                    const conversation =
                        await chatService.getConversationById(
                            data.conversationId
                        );

                    io.emit(
                        CHAT_EVENTS.CONVERSATION_UPDATED,
                        conversation
                    );
                } catch (error) {
                    console.error(error);
                }
            }
        );

        socket.on(
            CHAT_EVENTS.TYPING,
            (data: TypingPayload) => {
                socket.to(data.conversationId).emit(
                    CHAT_EVENTS.TYPING,
                    socket.userId
                );
            }
        );

        socket.on(
            CHAT_EVENTS.STOP_TYPING,
            (data: TypingPayload) => {
                socket.to(data.conversationId).emit(
                    CHAT_EVENTS.STOP_TYPING,
                    socket.userId
                );
            }
        );

        socket.on(
            CHAT_EVENTS.DELIVER_MESSAGE,
            (data: {
                conversationId: string;
                messageId: string;
            }) => {
                socket.to(data.conversationId).emit(
                    CHAT_EVENTS.MESSAGE_DELIVERED,
                    data.messageId
                );
            }
        );

        socket.on(
            CHAT_EVENTS.SEEN,
            async (data: {
                conversationId: string;
                messageId: string;
            }) => {
                try {
                    await chatService.markAsSeen(
                        data.conversationId,
                        socket.userId!
                    );

                    io.to(data.conversationId).emit(
                        CHAT_EVENTS.MESSAGES_SEEN,
                        {
                            messageId: data.messageId,
                            userId: socket.userId,
                        }
                    );
                } catch (error) {
                    console.error(error);
                }
            }
        );

        socket.on("disconnect", async () => {
            if (!socket.userId) {
                return;
            }

            const userId =
                onlineUsers.remove(
                    socket.id
                );

            io.emit(
                CHAT_EVENTS.ONLINE_USERS,
                onlineUsers.getAll()
            );

            if (
                userId &&
                !onlineUsers.isOnline(userId)
            ) {
                socket.broadcast.emit(
                    CHAT_EVENTS.USER_OFFLINE,
                    userId
                );
            }

            console.log(
                `Socket disconnected: ${socket.id}`
            );
        });
    });
}
