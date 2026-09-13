import { Types } from "mongoose";
import {
  SupportTicket,
  SupportTicketCategory,
  SupportTicketStatus,
} from "./support.model.js";

export const supportService = {
  async createTicket(params: {
    userId: string;
    subject: string;
    category?: SupportTicketCategory;
    message: string;
    banReason?: string | null;
  }) {
    const {
      userId,
      subject,
      category = "other",
      message,
      banReason = null,
    } = params;

    const ticket = await SupportTicket.create({
      user: new Types.ObjectId(userId),
      subject: subject.trim(),
      category,
      status: "open",
      banReason: banReason?.trim() || null,
      messages: [
        {
          sender: new Types.ObjectId(userId),
          senderType: "user",
          message: message.trim(),
          createdAt: new Date(),
        },
      ],
    });

    return ticket;
  },

  async getUserTickets(userId: string) {
    return SupportTicket.find({
      user: new Types.ObjectId(userId),
    })
      .sort({ updatedAt: -1 })
      .lean();
  },

  async getUserTicket(userId: string, ticketId: string) {
    if (!Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    return SupportTicket.findOne({
      _id: new Types.ObjectId(ticketId),
      user: new Types.ObjectId(userId),
    }).lean();
  },

  async addUserMessage(params: {
    userId: string;
    ticketId: string;
    message: string;
  }) {
    const { userId, ticketId, message } = params;

    if (!Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    const ticket = await SupportTicket.findOne({
      _id: new Types.ObjectId(ticketId),
      user: new Types.ObjectId(userId),
    });

    if (!ticket) {
      return null;
    }

    if (ticket.status === "closed") {
      throw new Error("TICKET_CLOSED");
    }

    ticket.messages.push({
      sender: new Types.ObjectId(userId),
      senderType: "user",
      message: message.trim(),
      createdAt: new Date(),
    });

    ticket.status = "open";

    await ticket.save();

    return ticket;
  },

  async closeTicket(userId: string, ticketId: string) {
    if (!Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    const ticket = await SupportTicket.findOne({
      _id: new Types.ObjectId(ticketId),
      user: new Types.ObjectId(userId),
    });

    if (!ticket) {
      return null;
    }

    ticket.status = "closed";

    await ticket.save();

    return ticket;
  },

  async getAllTickets(params?: {
  status?: SupportTicketStatus;
  category?: SupportTicketCategory;
}) {
  try {
    const filter: Record<string, unknown> = {};

    if (
      params?.status &&
      ["open", "pending", "closed"].includes(params.status)
    ) {
      filter.status = params.status;
    }

    if (
      params?.category &&
      [
        "account_banned",
        "account",
        "payments",
        "orders",
        "listings",
        "technical",
        "other",
      ].includes(params.category)
    ) {
      filter.category = params.category;
    }

    console.log(
      "[SUPPORT] Admin ticket filter:",
      filter,
    );

    const tickets = await SupportTicket.find(filter)
      .populate(
        "user",
        "username email avatar",
      )
      .sort({
        updatedAt: -1,
      })
      .lean();

    console.log(
      "[SUPPORT] Admin tickets found:",
      tickets.length,
    );

    return tickets;
  } catch (error) {
    console.error(
      "[SUPPORT] getAllTickets ERROR:",
      error,
    );

    throw error;
  }
},

  async getAdminTicket(ticketId: string) {
    if (!Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    return SupportTicket.findById(new Types.ObjectId(ticketId))
      .populate("user", "username email avatar")
      .lean();
  },

  async addAdminMessage(params: {
    ticketId: string;
    adminId: string;
    message: string;
  }) {
    const { ticketId, adminId, message } = params;

    if (!Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    const ticket = await SupportTicket.findById(new Types.ObjectId(ticketId));

    if (!ticket) {
      return null;
    }

    if (ticket.status === "closed") {
      throw new Error("TICKET_CLOSED");
    }

    ticket.messages.push({
      sender: new Types.ObjectId(adminId),
      senderType: "admin",
      message: message.trim(),
      createdAt: new Date(),
    });

    ticket.status = "pending";

    await ticket.save();

    return ticket;
  },

  async setTicketStatus(ticketId: string, status: SupportTicketStatus) {
    if (!Types.ObjectId.isValid(ticketId)) {
      return null;
    }

    const ticket = await SupportTicket.findById(new Types.ObjectId(ticketId));

    if (!ticket) {
      return null;
    }

    ticket.status = status;

    await ticket.save();

    return ticket;
  },
};
