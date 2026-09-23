import { Request, Response } from "express";
import mongoose from "mongoose";
import { savedCardService } from "./saved-card.service.js";

interface AuthRequest extends Request {
  userId?: string;
}

export const savedCardController = {
  /**
   * GET /payments/cards
   */
  async list(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const cards = await savedCardService.getSavedCards(req.userId);

      return res.json({
        success: true,
        data: cards,
      });
    } catch (error) {
      console.error("Get saved cards error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to load saved cards",
      });
    }
  },

  /**
   * POST /payments/cards
   */
  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const {
        provider,
        providerReference,
        brand,
        last4,
        expMonth,
        expYear,
        isDefault,
      } = req.body;

      if (provider !== "netopia") {
        return res.status(400).json({
          success: false,
          message: "Unsupported payment provider",
        });
      }

      if (!providerReference) {
        return res.status(400).json({
          success: false,
          message: "Provider reference is required",
        });
      }

      if (!brand) {
        return res.status(400).json({
          success: false,
          message: "Card brand is required",
        });
      }

      if (!last4) {
        return res.status(400).json({
          success: false,
          message: "Last 4 digits are required",
        });
      }

      const card = await savedCardService.createSavedCard(
        req.userId,
        {
          provider,
          providerReference,
          brand,
          last4,
          expMonth:
            expMonth !== undefined && expMonth !== null
              ? Number(expMonth)
              : undefined,
          expYear:
            expYear !== undefined && expYear !== null
              ? Number(expYear)
              : undefined,
          isDefault: isDefault === true,
        },
      );

      return res.status(201).json({
        success: true,
        message: "Card saved successfully",
        data: card,
      });
    } catch (error: any) {
      console.error("Create saved card error:", error);

      const message = error?.message ?? "Failed to save card";

      const status =
        message === "USER_NOT_FOUND"
          ? 404
          : message.startsWith("CARD_")
            ? 400
            : 500;

      return res.status(status).json({
        success: false,
        message,
      });
    }
  },

  /**
   * PATCH /payments/cards/:id/default
   */
  async setDefault(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid card ID",
        });
      }

      const card = await savedCardService.setDefaultCard(
        req.userId,
        id as string,
      );

      return res.json({
        success: true,
        message: "Default card updated",
        data: card,
      });
    } catch (error: any) {
      console.error("Set default card error:", error);

      const message = error?.message ?? "Failed to set default card";

      if (message === "CARD_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Card not found",
        });
      }

      return res.status(500).json({
        success: false,
        message,
      });
    }
  },

  /**
   * DELETE /payments/cards/:id
   */
  async remove(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid card ID",
        });
      }

      await savedCardService.deleteSavedCard(
        req.userId,
        id as string,
      );

      return res.json({
        success: true,
        message: "Card deleted successfully",
      });
    } catch (error: any) {
      console.error("Delete saved card error:", error);

      const message = error?.message ?? "Failed to delete card";

      if (message === "CARD_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Card not found",
        });
      }

      return res.status(500).json({
        success: false,
        message,
      });
    }
  },
};