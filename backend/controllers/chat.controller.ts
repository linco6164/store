import { Response } from "express";

import chatService from "../services/chat.service.js";
import { AuthRequest } from "../middleware/auth.js";
import { getSocketIO } from "../sockets/socket.io.js";
import { CHAT_EVENTS } from "../sockets/events.js";

async function emitConversationUpdate(conversationId: string) {
  const io = getSocketIO();
  const conversation = await chatService.getConversationById(conversationId);

  for (const participant of conversation?.participants ?? []) {
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
}

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
      await emitConversationUpdate(conversationId);

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

      getSocketIO()
        .to(conversationId)
        .emit(CHAT_EVENTS.NEW_MESSAGE, message);
      await emitConversationUpdate(conversationId);

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

      getSocketIO()
        .to(offer.conversation.toString())
        .emit(CHAT_EVENTS.OFFER_UPDATED, {
          conversationId: offer.conversation.toString(),
          offerId: offer._id.toString(),
          status: offer.status,
        });

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

      getSocketIO()
        .to(offer.conversation.toString())
        .emit(CHAT_EVENTS.OFFER_UPDATED, {
          conversationId: offer.conversation.toString(),
          offerId: offer._id.toString(),
          status: offer.status,
        });

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

      if (result.mode === "everyone") {
        getSocketIO()
          .to(result.conversationId)
          .emit(CHAT_EVENTS.MESSAGE_DELETED, {
            conversationId: result.conversationId,
            messageId: result.messageId,
          });
        await emitConversationUpdate(result.conversationId);
      }

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

  async deleteConversation(
    req: AuthRequest,
    res: Response,
) {
    try {
        const conversationId =
            Array.isArray(
                req.params.conversationId,
            )
                ? req.params.conversationId[0]
                : req.params.conversationId;

        const result =
            await chatService.deleteConversation(
                conversationId,
                req.userId!,
            );

        return res.json({
            success: true,
            ...result,
        });
    } catch (error: any) {
        console.error(
            "DELETE CONVERSATION ERROR:",
            error,
        );

        return res.status(400).json({
            success: false,
            message:
                error?.message ??
                "Failed to delete conversation.",
        });
    }
}
}

export default new ChatController();
