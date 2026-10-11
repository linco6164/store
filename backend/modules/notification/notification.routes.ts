import { Router } from "express";

import auth from "../../middleware/auth.js";

import {
    notificationController,
} from "./notification.controller.js";

import staffAccess from "../../middleware/staffAccess.js";

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

// ============================================================
// INTERNAL TEST - SAMEDAY ORDER NOTIFICATION
// ============================================================

router.post(
  "/internal/test-sameday-order/:orderId",
  auth,
  staffAccess,
  notificationController.testSamedayOrderNotification,
);

router.post(
    "/push-token",
    auth,
    notificationController.registerPushToken
);

export default router;