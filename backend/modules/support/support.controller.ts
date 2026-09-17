import type { Response } from "express";

import type { AuthRequest } from "../../middleware/auth.js";

import { getSocketIO } from "../../sockets/socket.io.js";

import {
  SupportTicket,
  type SupportTicketCategory,
  type SupportTicketDepartment,
  type SupportTicketPriority,
  type SupportTicketStatus,
} from "./support.model.js";

import { supportService } from "./support.service.js";

function getUserId(req: AuthRequest): string {
  if (!req.userId) {
    throw new Error("UNAUTHORIZED");
  }

  return req.userId;
}

function getTicketId(req: AuthRequest): string {
  return String(req.params.id);
}

function emitTicketNew(ticket: any) {
  const io = getSocketIO();

  io.to(`support:${ticket.department}`).emit("support:ticket:new", {
    ticket,
  });
}

function emitTicketUpdated(ticket: any, type: string) {
  const io = getSocketIO();

  io.to(`support:${ticket.department}`).emit("support:ticket:updated", {
    ticket,
    type,
  });
}

function emitTicketAssigned(ticket: any) {
  const io = getSocketIO();

  io.to(`support:${ticket.department}`).emit("support:ticket:assigned", {
    ticket,
  });
}

function emitMessageNew(ticket: any, message: any) {
  const io = getSocketIO();

  io.to(`support:${ticket.department}`).emit("support:message:new", {
    ticketId: ticket._id,
    message,
  });
}

function handleError(error: unknown, res: Response) {
  const message = error instanceof Error ? error.message : "Unknown error.";

  console.error("SUPPORT ERROR:", error);

  switch (message) {
    case "UNAUTHORIZED":
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });

    case "TICKET_NOT_FOUND":
      return res.status(404).json({
        success: false,
        message: "Ticket not found.",
      });

    case "FORBIDDEN":
      return res.status(403).json({
        success: false,
        message: "Nu ai acces la acest ticket.",
      });

    case "INVALID_CATEGORY":
      return res.status(400).json({
        success: false,
        message: "Categoria ticketului este invalidă.",
      });

    default:
      return res.status(500).json({
        success: false,
        message: "Eroare server.",
      });
  }
}

/*
|--------------------------------------------------------------------------
| USER
|--------------------------------------------------------------------------
*/

export async function createTicket(req: AuthRequest, res: Response) {
  try {
    const userId = getUserId(req);

    const { subject, category, message } = req.body as {
      subject: string;
      category: SupportTicketCategory;
      message: string;
    };

    const ticket = await supportService.createTicket(userId, {
      subject,
      category,
      message,
    });

    emitTicketNew(ticket);

    return res.status(201).json({
      success: true,
      ticket,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function getUserTickets(req: AuthRequest, res: Response) {
  try {
    const userId = getUserId(req);

    const tickets = await supportService.getUserTickets(userId);

    return res.json({
      success: true,
      tickets,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function getUserTicket(req: AuthRequest, res: Response) {
  try {
    const userId = getUserId(req);
    const ticketId = getTicketId(req);

    const ticket = await supportService.getUserTicket(userId, ticketId);

    return res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function addUserMessage(req: AuthRequest, res: Response) {
  try {
    const userId = getUserId(req);
    const ticketId = getTicketId(req);

    const { message } = req.body as {
      message: string;
    };

    const ticket = await supportService.addUserMessage(
      userId,
      ticketId,
      message,
    );

    const newMessage = ticket.messages[ticket.messages.length - 1];

    emitMessageNew(ticket, newMessage);

    emitTicketUpdated(ticket, "message");

    return res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

/*
|--------------------------------------------------------------------------
| STAFF
|--------------------------------------------------------------------------
*/

export async function getStaffTickets(req: AuthRequest, res: Response) {
  try {
    const userId = getUserId(req);

    const { status, department, assignedTo, priority } = req.query as {
      status?: SupportTicketStatus;
      department?: SupportTicketDepartment;
      assignedTo?: string;
      priority?: SupportTicketPriority;
    };

    const tickets = await supportService.getStaffTickets(userId, {
      status,
      department,
      assignedTo,
      priority,
    });

    return res.json({
      success: true,
      tickets,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function getStaffTicket(req: AuthRequest, res: Response) {
  try {
    const userId = getUserId(req);
    const ticketId = getTicketId(req);

    const ticket = await supportService.getStaffTicket(userId, ticketId);

    return res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function getStaffStats(req: AuthRequest, res: Response) {
  try {
    const userId = getUserId(req);

    const stats = await supportService.getStaffStats(userId);

    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function assignToMe(req: AuthRequest, res: Response) {
  try {
    const userId = getUserId(req);
    const ticketId = getTicketId(req);

    const ticket = await supportService.assignToMe(userId, ticketId);

    emitTicketAssigned(ticket);

    emitTicketUpdated(ticket, "assigned");

    return res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function unassignTicket(req: AuthRequest, res: Response) {
  try {
    const userId = getUserId(req);
    const ticketId = getTicketId(req);

    const ticket = await supportService.unassignTicket(userId, ticketId);

    emitTicketUpdated(ticket, "unassigned");

    return res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function updateStatus(req: AuthRequest, res: Response) {
  try {
    const userId = getUserId(req);
    const ticketId = getTicketId(req);

    const { status } = req.body as {
      status: SupportTicketStatus;
    };

    const ticket = await supportService.updateStatus(userId, ticketId, status);

    emitTicketUpdated(ticket, "status");

    return res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function updatePriority(req: AuthRequest, res: Response) {
  try {
    const userId = getUserId(req);
    const ticketId = getTicketId(req);

    const { priority } = req.body as {
      priority: SupportTicketPriority;
    };

    const ticket = await supportService.updatePriority(
      userId,
      ticketId,
      priority,
    );

    emitTicketUpdated(ticket, "priority");

    return res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function addStaffMessage(req: AuthRequest, res: Response) {
  try {
    const userId = getUserId(req);
    const ticketId = getTicketId(req);

    const { message } = req.body as {
      message: string;
    };

    const ticket = await supportService.addStaffMessage(
      userId,
      ticketId,
      message,
    );

    const newMessage = ticket.messages[ticket.messages.length - 1];

    emitMessageNew(ticket, newMessage);

    emitTicketUpdated(ticket, "message");

    return res.json({
      success: true,
      ticket,
    });
  } catch (error) {
    return handleError(error, res);
  }
}

export async function getStaffInfo(req: AuthRequest, res: Response) {
  try {
    const userId = getUserId(req);

    const info = await supportService.getStaffInfo(userId);

    return res.json({
      success: true,
      ...info,
    });
  } catch (error) {
    return handleError(error, res);
  }
}
