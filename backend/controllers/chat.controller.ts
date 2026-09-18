import { Response } from "express";

import chatService from "../services/chat.service.js";
import { AuthRequest } from "../middleware/auth.js";

class ChatController {
  async startConversation(req: AuthRequest, res: Response) {
    try {
      const senderId = req.userId!;

      const { listingId } = req.body;

      const conversation = await chatService.startConversation(
        senderId,
        listingId,
      );

      return res.status(201).json({
        success: true,
        conversation,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to start conversation.",
      });
    }
  }

  async getConversations(req: AuthRequest, res: Response) {
    try {
      const conversations = await chatService.getConversations(req.userId!);

      return res.json({
        success: true,
        conversations,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to load conversations.",
      });
    }
  }

  async getConversation(req: AuthRequest, res: Response) {
    try {
      const conversationId = Array.isArray(req.params.conversationId)
        ? req.params.conversationId[0]
        : req.params.conversationId;

      const conversation = await chatService.getConversation(
        conversationId,
        req.userId!,
      );

      res.json(conversation);
    } catch (error: any) {
      console.error(error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getMessages(req: AuthRequest, res: Response) {
    try {
      const conversationId = Array.isArray(req.params.conversationId)
        ? req.params.conversationId[0]
        : req.params.conversationId;

      const messages = await chatService.getMessages(
        conversationId,
        req.userId!,
      );

      return res.json({
        success: true,
        messages,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to load messages.",
      });
    }
  }

  async sendMessage(req: AuthRequest, res: Response) {
    try {
      console.log("=== SEND MESSAGE ===");
      console.log(req.body);

      const senderId = req.userId!;

      const { conversationId, text, images } = req.body;

      const normalizedImages = Array.isArray(images)
        ? images
        : images
          ? [images]
          : [];

      const message = await chatService.sendMessage(
        conversationId,
        senderId,
        text,
        normalizedImages,
      );

      return res.status(201).json({
        success: true,
        message,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to send message.",
      });
    }
  }

  async markAsSeen(req: AuthRequest, res: Response) {
    try {
      const conversationId = Array.isArray(req.params.conversationId)
        ? req.params.conversationId[0]
        : req.params.conversationId;

      await chatService.markAsSeen(conversationId, req.userId!);

      return res.json({
        success: true,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to mark messages as seen.",
      });
    }
  }

  async sendOffer(req: AuthRequest, res: Response) {
    try {
      const senderId = req.userId!;

      const conversationId = req.body.conversationId;

      const amount = Number(req.body.amount);

      const message = await chatService.sendOffer(
        conversationId,
        senderId,
        amount,
      );

      return res.status(201).json({
        success: true,
        message,
      });
    } catch (error: any) {
      console.error("SEND OFFER ERROR:", error);

      return res.status(400).json({
        success: false,
        message: error?.message ?? "Failed to send offer.",
      });
    }
  }

  async acceptOffer(req: AuthRequest, res: Response) {
    try {
      const offerId = Array.isArray(req.params.offerId)
        ? req.params.offerId[0]
        : req.params.offerId;

      const offer = await chatService.acceptOffer(offerId, req.userId!);

      return res.json({
        success: true,
        offer,
      });
    } catch (error: any) {
      console.error("ACCEPT OFFER ERROR:", error);

      return res.status(400).json({
        success: false,
        message: error?.message ?? "Failed to accept offer.",
      });
    }
  }

  async rejectOffer(req: AuthRequest, res: Response) {
    try {
      const offerId = Array.isArray(req.params.offerId)
        ? req.params.offerId[0]
        : req.params.offerId;

      const offer = await chatService.rejectOffer(offerId, req.userId!);

      return res.json({
        success: true,
        offer,
      });
    } catch (error: any) {
      console.error("REJECT OFFER ERROR:", error);

      return res.status(400).json({
        success: false,
        message: error?.message ?? "Failed to reject offer.",
      });
    }
  }

  async deleteMessage(req: AuthRequest, res: Response) {
    try {
      const messageId = Array.isArray(req.params.messageId)
        ? req.params.messageId[0]
        : req.params.messageId;

      const mode = req.body.mode === "everyone" ? "everyone" : "me";

      const result = await chatService.deleteMessage(
        messageId,
        req.userId!,
        mode,
      );

      return res.json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("DELETE MESSAGE ERROR:", error);

      return res.status(400).json({
        success: false,
        message: error?.message ?? "Failed to delete message.",
      });
    }
  }
}

export default new ChatController();
