import { Response } from "express";

import chatService from "../services/chat.service.js";
import { AuthRequest } from "../middleware/auth.js";

class ChatController {
    async startConversation(
        req: AuthRequest,
        res: Response
    ) {
        try {
            const senderId = req.userId!;

            const {
                receiverId,
                listingId,
            } = req.body;

            const conversation =
                await chatService.startConversation(
                    senderId,
                    receiverId,
                    listingId
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

    async getConversations(
        req: AuthRequest,
        res: Response
    ) {
        try {
            const conversations =
                await chatService.getConversations(
                    req.userId!
                );

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

    async getConversation(
        req: AuthRequest,
        res: Response
    ) {
        try {
            const conversationId = Array.isArray(
                req.params.conversationId
            )
                ? req.params.conversationId[0]
                : req.params.conversationId;

            const conversation =
                await chatService.getConversation(
                    conversationId,
                    req.userId!
                );

            res.json(conversation);
        } catch (error: any) {
            res.status(400).json({
                message: error.message,
            });
        }
    }

    async getMessages(
        req: AuthRequest,
        res: Response
    ) {
        try {
            const conversationId = Array.isArray(req.params.conversationId)
                ? req.params.conversationId[0]
                : req.params.conversationId;

            const messages =
                await chatService.getMessages(
                    conversationId
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

    async sendMessage(
        req: AuthRequest,
        res: Response
    ) {
        try {
            const senderId = req.userId!;

            const {
                conversationId,
                text,
                images,
            } = req.body;

            const normalizedImages = Array.isArray(images)
                ? images
                : images
                    ? [images]
                    : [];

            const message = await chatService.sendMessage(
                conversationId,
                senderId,
                text,
                normalizedImages
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

    async markAsSeen(
        req: AuthRequest,
        res: Response
    ) {
        try {
            const conversationId = Array.isArray(req.params.conversationId)
                ? req.params.conversationId[0]
                : req.params.conversationId;

            await chatService.markAsSeen(
                conversationId,
                req.userId!
            );

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
}

export default new ChatController();