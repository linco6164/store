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
            }) => {
                try {
                    const message =
                        await chatService.sendMessage(
                            data.conversationId,
                            socket.userId!,
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
            CHAT_EVENTS.SEEN,
            async (data: SeenPayload) => {
                try {
                    await chatService.markAsSeen(
                        data.conversationId,
                        socket.userId!
                    );

                    io.to(data.conversationId).emit(
                        CHAT_EVENTS.MESSAGES_SEEN,
                        socket.userId
                    );
                } catch (error) {
                    console.error(error);
                }
            }
        );

        socket.on("disconnect", () => {
            onlineUsers.remove(socket.id);

            socket.broadcast.emit(
                CHAT_EVENTS.USER_OFFLINE,
                socket.userId
            );

            console.log(
                `Socket disconnected: ${socket.id}`
            );
        });
    });
}