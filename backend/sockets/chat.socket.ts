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
import User from "../models/Users.js";
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

    // =========================================================
    // CHAT
    // =========================================================

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

          const participants = conversation?.participants ?? [];

          for (const participant of participants) {
            const participantId =
              typeof participant === "object" &&
              participant !== null &&
              "_id" in participant
                ? String((participant as any)._id)
                : String(participant);

            io.to(`user:${participantId}`).emit(
              CHAT_EVENTS.CONVERSATION_UPDATED,
              conversation,
            );
          }
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

    // =========================================================
    // SUPPORT - ADMIN ROOM
    // =========================================================

    socket.on("support:admin:join", async () => {
      try {
        const user = await User.findById(socket.userId).select("_id role");

        if (!user) {
          socket.emit("support:error", {
            message: "Utilizatorul nu a fost găsit.",
          });

          return;
        }

        if (user.role !== "admin") {
          socket.emit("support:error", {
            message: "Nu ai acces la suportul administrativ.",
          });

          return;
        }

        socket.join("support:admins");

        console.log(`[SUPPORT] Admin ${socket.userId} joined support:admins`);
      } catch (error) {
        console.error("[SUPPORT] ADMIN JOIN ERROR:", error);

        socket.emit("support:error", {
          message: "Nu s-a putut conecta la suport.",
        });
      }
    });

    socket.on("support:admin:leave", async () => {
      socket.leave("support:admins");

      console.log(`[SUPPORT] ${socket.userId} left support:admins`);
    });

    // =========================================================
    // SUPPORT - JOIN TICKET
    // =========================================================

    socket.on("support:join", async (ticketId: string) => {
      try {
        if (!ticketId) {
          return;
        }

        const user = await User.findById(socket.userId).select("_id role");

        if (!user) {
          socket.emit("support:error", {
            message: "Utilizatorul nu a fost găsit.",
          });

          return;
        }

        const ticket = await SupportTicket.findById(ticketId);

        if (!ticket) {
          socket.emit("support:error", {
            message: "Tichetul nu a fost găsit.",
          });

          return;
        }

        const isAdmin = user.role === "admin";

        const isTicketOwner = ticket.user.toString() === socket.userId;

        if (!isAdmin && !isTicketOwner) {
          socket.emit("support:error", {
            message: "Nu ai acces la acest tichet.",
          });

          return;
        }

        const room = `support:${ticketId}`;

        socket.join(room);

        console.log(
          `[SUPPORT] ${socket.userId} joined ${room} (${isAdmin ? "ADMIN" : "USER"})`,
        );
      } catch (error) {
        console.error("[SUPPORT] JOIN ERROR:", error);

        socket.emit("support:error", {
          message: "Nu s-a putut deschide conversația.",
        });
      }
    });

    // =========================================================
    // SUPPORT - NEW TICKET
    // =========================================================
    // Userul creează ticketul prin HTTP, apoi Flutter emite
    // acest eveniment pentru a anunța adminii în timp real.
    // =========================================================

    socket.on("support:ticket:created", async (ticketId: string) => {
      try {
        if (!ticketId) {
          return;
        }

        const ticket = await SupportTicket.findOne({
          _id: ticketId,
          user: socket.userId,
        })
          .populate("user", "username email avatar")
          .lean();

        if (!ticket) {
          console.log(
            `[SUPPORT] Ticket not found or unauthorized: ${ticketId}`,
          );

          return;
        }

        io.to("support:admins").emit("support:ticket:new", {
          ticket,
        });

        console.log(`[SUPPORT] New ticket ${ticketId} sent to admins`);
      } catch (error) {
        console.error("[SUPPORT] TICKET CREATED ERROR:", error);
      }
    });

    // =========================================================
    // SUPPORT - MESSAGE
    // =========================================================

    socket.on(
      "support:message",
      async (
        data: {
          ticketId: string;
          message: string;
        },
        callback?: (response: { success: boolean; message?: string }) => void,
      ) => {
        try {
          const { ticketId, message } = data;

          if (!ticketId || !message?.trim()) {
            callback?.({
              success: false,
              message: "Mesajul este obligatoriu.",
            });

            return;
          }

          const user = await User.findById(socket.userId).select("_id role");

          if (!user) {
            callback?.({
              success: false,
              message: "Utilizatorul nu a fost găsit.",
            });

            return;
          }

          const ticket = await SupportTicket.findById(ticketId);

          if (!ticket) {
            callback?.({
              success: false,
              message: "Tichetul nu a fost găsit.",
            });

            return;
          }

          const isAdmin = user.role === "admin";

          const isTicketOwner = ticket.user.toString() === socket.userId;

          if (!isAdmin && !isTicketOwner) {
            callback?.({
              success: false,
              message: "Nu ai acces la acest tichet.",
            });

            return;
          }

          if (ticket.status === "closed") {
            callback?.({
              success: false,
              message: "Acest tichet este închis.",
            });

            return;
          }

          ticket.messages.push({
            sender: new Types.ObjectId(socket.userId!),
            senderType: isAdmin ? "admin" : "user",
            message: message.trim(),
            createdAt: new Date(),
          });

          ticket.status = isAdmin ? "pending" : "open";

          await ticket.save();

          const savedMessage = ticket.messages[ticket.messages.length - 1];

          const room = `support:${ticketId}`;

          // Utilizator + admini care au ticketul deschis
          io.to(room).emit("support:message:new", {
            ticketId,
            message: savedMessage,
          });

          io.to(room).emit("support:ticket:updated", {
            ticketId,
            status: ticket.status,
            updatedAt: ticket.updatedAt,
          });

          // Adminii care nu sunt în camera ticketului
          if (!isAdmin) {
            io.to("support:admins").emit("support:message:new", {
              ticketId,
              message: savedMessage,
            });

            io.to("support:admins").emit("support:ticket:updated", {
              ticketId,
              ticket: {
                _id: ticket._id,
                user: ticket.user,
                subject: ticket.subject,
                category: ticket.category,
                status: ticket.status,
                banReason: ticket.banReason,
                updatedAt: ticket.updatedAt,
                lastMessage: savedMessage,
              },
            });
          }

          callback?.({
            success: true,
          });

          console.log(
            `[SUPPORT] ${
              isAdmin ? "ADMIN" : "USER"
            } ${socket.userId} sent message in ${room}`,
          );
        } catch (error) {
          console.error("[SUPPORT] MESSAGE ERROR:", error);

          callback?.({
            success: false,
            message: "Mesajul nu a putut fi trimis.",
          });

          socket.emit("support:error", {
            message: "Mesajul nu a putut fi trimis.",
          });
        }
      },
    );

    // =========================================================
    // SUPPORT - LEAVE TICKET
    // =========================================================

    socket.on("support:leave", (ticketId: string) => {
      if (!ticketId) {
        return;
      }

      const room = `support:${ticketId}`;

      socket.leave(room);

      console.log(`[SUPPORT] ${socket.userId} left ${room}`);
    });

    // =========================================================
    // DISCONNECT
    // =========================================================

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
