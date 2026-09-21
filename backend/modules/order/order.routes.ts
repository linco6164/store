import { Router } from "express";
import auth from "../../middleware/auth.js";

import {
  getMyOrders,
  getMySellingOrders,
  getCompletedOrders,
  getOrder,
} from "./order.controller.js";

const router = Router();

router.get(
  "/",
  auth,
  getMyOrders,
);

router.get(
  "/selling",
  auth,
  getMySellingOrders,
);

router.get(
  "/completed",
  auth,
  getCompletedOrders,
);

router.get(
  "/:id",
  auth,
  getOrder,
);

export default router;