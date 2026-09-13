import { Request, Response } from "express";
import { supportService } from "./support.service.js";

interface AuthRequest extends Request {
  userId?: string;
}

export const supportController = {
  async createTicket(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { subject, category, message, banReason } = req.body;

      if (!subject?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Subiectul este obligatoriu.",
        });
      }

      if (!message?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Mesajul este obligatoriu.",
        });
      }

      const ticket = await supportService.createTicket({
        userId,
        subject,
        category,
        message,
        banReason,
      });

      return res.status(201).json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      console.error("CREATE SUPPORT TICKET ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Nu s-a putut crea tichetul.",
      });
    }
  },

  async getTickets(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const tickets = await supportService.getUserTickets(userId);

      return res.json({
        success: true,
        data: tickets,
      });
    } catch (error) {
      console.error("GET SUPPORT TICKETS ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Nu s-au putut încărca tichetele.",
      });
    }
  },

  async getTicket(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const ticketId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const ticket = await supportService.getUserTicket(userId, ticketId);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Tichetul nu a fost găsit.",
        });
      }

      return res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      console.error("GET SUPPORT TICKET ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Nu s-a putut încărca tichetul.",
      });
    }
  },

  async addMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      if (!req.body.message?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Mesajul este obligatoriu.",
        });
      }

      const ticketId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const ticket = await supportService.addUserMessage({
        userId,
        ticketId: String(ticketId),
        message: req.body.message,
      });

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Tichetul nu a fost găsit.",
        });
      }

      return res.status(201).json({
        success: true,
        data: ticket,
      });
    } catch (error: any) {
      if (error?.message === "TICKET_CLOSED") {
        return res.status(400).json({
          success: false,
          message: "Acest tichet este închis.",
        });
      }

      console.error("ADD SUPPORT MESSAGE ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Nu s-a putut trimite mesajul.",
      });
    }
  },

  async closeTicket(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const ticketId = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;

      const ticket = await supportService.closeTicket(userId, ticketId);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: "Tichetul nu a fost găsit.",
        });
      }

      return res.json({
        success: true,
        data: ticket,
      });
    } catch (error) {
      console.error("CLOSE SUPPORT TICKET ERROR:", error);

      return res.status(500).json({
        success: false,
        message: "Nu s-a putut închide tichetul.",
      });
    }
  },
};
