import { Router } from "express";
import auth from "../../middleware/auth.js";

import financeAccess from "../../middleware/financeAccess.js";

import {
  getMyOrders,
  getMySellingOrders,
  getCompletedOrders,
  getOrder,
  confirmOrderReceived,
  reportIssue,
  resolveIssueSellerRelease,
  resolveIssueBuyerRefund,
} from "./order.controller.js";

const router = Router();

router.get("/", auth, getMyOrders);

router.get("/selling", auth, getMySellingOrders);

router.get("/completed", auth, getCompletedOrders);

router.patch("/:id/confirm-received", auth, confirmOrderReceived);

router.post("/:id/report-issue", auth, reportIssue);

router.patch(
  "/:id/resolve-issue/seller-release",
  auth,
  financeAccess,
  resolveIssueSellerRelease,
);

router.patch(
  "/:id/resolve-issue/buyer-refund",
  auth,
  financeAccess,
  resolveIssueBuyerRefund,
);

router.get("/:id", auth, getOrder);

export default router;
