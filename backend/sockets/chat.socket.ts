import { Server } from "socket.io";

import {
  AuthenticatedSocket,
  TypingPayload,
  SeenPayload,
} from "../types/socket.js";

import onlineUsers from "./onlineUsers.js";
import chatService from "../services/chat.service.js";
import { CHAT_EVENTS } from "./events.js";

import { Types } from "mongoose";
import { SupportTicket } from "../modules/support/support.model.js";

export default function registerChatSocket(io: Server) {
  io.on("connection", (socket: AuthenticatedSocket) => {
    console.log("Socket connected:", socket.id);
    console.log("User:", socket.userId);

    if (!socket.userId) {
      socket.disconnect(true);
      return;
    }

    socket.join(`user:${socket.userId}`);

    onlineUsers.add(socket.userId, socket.id);

    io.emit(CHAT_EVENTS.ONLINE_USERS, onlineUsers.getAll());

    socket.broadcast.emit(CHAT_EVENTS.USER_ONLINE, socket.userId);

    socket.on(CHAT_EVENTS.JOIN_CONVERSATION, (conversationId: string) => {
      socket.join(conversationId);
    });

    socket.on(CHAT_EVENTS.LEAVE_CONVERSATION, (conversationId: string) => {
      socket.leave(conversationId);
    });

    socket.on(
      CHAT_EVENTS.SEND_MESSAGE,
      async (data: {
        conversationId: string;
        text: string;
        images?: string[];
        replyTo?: string;
      }) => {
        try {
          const message = await chatService.sendMessage(
            data.conversationId,
            socket.userId!,
            data.text,
            data.images ?? [],
            data.replyTo,
          );

          io.to(data.conversationId).emit(CHAT_EVENTS.NEW_MESSAGE, message);

          const conversation = await chatService.getConversationById(
            data.conversationId,
          );

          io.emit(CHAT_EVENTS.CONVERSATION_UPDATED, conversation);
        } catch (error) {
          console.error(error);
        }
      },
    );

    socket.on(CHAT_EVENTS.TYPING, (data: TypingPayload) => {
      socket.to(data.conversationId).emit(CHAT_EVENTS.TYPING, socket.userId);
    });

    socket.on(CHAT_EVENTS.STOP_TYPING, (data: TypingPayload) => {
      socket
        .to(data.conversationId)
        .emit(CHAT_EVENTS.STOP_TYPING, socket.userId);
    });

    socket.on(
      CHAT_EVENTS.DELIVER_MESSAGE,
      (data: { conversationId: string; messageId: string }) => {
        socket
          .to(data.conversationId)
          .emit(CHAT_EVENTS.MESSAGE_DELIVERED, data.messageId);
      },
    );

    socket.on(
      CHAT_EVENTS.SEEN,
      async (data: { conversationId: string; messageId: string }) => {
        try {
          await chatService.markAsSeen(data.conversationId, socket.userId!);

          io.to(data.conversationId).emit(CHAT_EVENTS.MESSAGES_SEEN, {
            messageId: data.messageId,
            userId: socket.userId,
          });
        } catch (error) {
          console.error(error);
        }
      },
    );

    socket.on("support:join", async (ticketId: string) => {
      try {
        if (!ticketId) {
          return;
        }

        const ticket = await SupportTicket.findOne({
          _id: ticketId,
          user: socket.userId,
        });

        if (!ticket) {
          socket.emit("support:error", {
            message: "Tichetul nu a fost găsit.",
          });

          return;
        }

        const room = `support:${ticketId}`;

        socket.join(room);

        console.log(`[SUPPORT] ${socket.userId} joined ${room}`);
      } catch (error) {
        console.error("[SUPPORT] JOIN ERROR:", error);

        socket.emit("support:error", {
          message: "Nu s-a putut deschide conversația.",
        });
      }
    });

    socket.on(
      "support:message",
      async (data: { ticketId: string; message: string }) => {
        try {
          const { ticketId, message } = data;

          if (!ticketId || !message?.trim()) {
            return;
          }

          const ticket = await SupportTicket.findOne({
            _id: ticketId,
            user: socket.userId,
          });

          if (!ticket) {
            socket.emit("support:error", {
              message: "Tichetul nu a fost găsit.",
            });

            return;
          }

          if (ticket.status === "closed") {
            socket.emit("support:error", {
              message: "Acest tichet este închis.",
            });

            return;
          }

          ticket.messages.push({
            sender: new Types.ObjectId(socket.userId!),
            senderType: "user",
            message: message.trim(),
            createdAt: new Date(),
          });

          ticket.status = "open";

          await ticket.save();

          const savedMessage = ticket.messages[ticket.messages.length - 1];

          const room = `support:${ticketId}`;

          io.to(room).emit("support:message:new", {
            ticketId,
            message: savedMessage,
          });

          io.to(room).emit("support:ticket:updated", {
            ticketId,
            status: ticket.status,
            updatedAt: ticket.updatedAt,
          });
        } catch (error) {
          console.error("[SUPPORT] MESSAGE ERROR:", error);

          socket.emit("support:error", {
            message: "Mesajul nu a putut fi trimis.",
          });
        }
      },
    );

    socket.on("support:leave", (ticketId: string) => {
      if (!ticketId) {
        return;
      }

      socket.leave(`support:${ticketId}`);

      console.log(`[SUPPORT] ${socket.userId} left support:${ticketId}`);
    });

    socket.on("disconnect", async () => {
      if (!socket.userId) {
        return;
      }

      const userId = onlineUsers.remove(socket.id);

      io.emit(CHAT_EVENTS.ONLINE_USERS, onlineUsers.getAll());

      if (userId && !onlineUsers.isOnline(userId)) {
        socket.broadcast.emit(CHAT_EVENTS.USER_OFFLINE, userId);
      }

      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}
