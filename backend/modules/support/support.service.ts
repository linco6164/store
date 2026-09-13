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
    const {
      userId,
      ticketId,
      message,
    } = params;

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

  async closeTicket(
    userId: string,
    ticketId: string,
  ) {
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
};