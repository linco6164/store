import { Router } from "express";

import chatController from "../controllers/chat.controller.js";
import authMiddleware  from "../middleware/auth.js";

const router = Router();

router.use(authMiddleware);

// Creează sau returnează o conversație existentă
router.post(
    "/start",
    chatController.startConversation
);

// Lista conversațiilor utilizatorului autentificat
router.get(
    "/conversations",
    chatController.getConversations
);

router.get(
    "/:conversationId",
    chatController.getConversation
);

// Mesajele unei conversații
router.get(
    "/:conversationId/messages",
    chatController.getMessages
);

// Trimite un mesaj
router.post(
    "/send",
    chatController.sendMessage
);

// Marchează mesajele ca citite
router.patch(
    "/:conversationId/seen",
    chatController.markAsSeen
);

export default router;