import { Router } from "express";

import auth from "../../middleware/auth.js";

import {
    notificationController,
} from "./notification.controller.js";

const router = Router();

router.get(
    "/",
    auth,
    notificationController.getAll
);

router.get(
    "/unread-count",
    auth,
    notificationController.unreadCount
);

router.patch(
    "/read-all",
    auth,
    notificationController.markAllAsRead
);

router.patch(
    "/:id/read",
    auth,
    notificationController.markAsRead
);

router.delete(
    "/:id",
    auth,
    notificationController.remove
);

export default router;