import { Router } from "express";
import auth from "../../middleware/auth.js";

import {
  getMyOrders,
  getMySellingOrders,
  getCompletedOrders,
  getOrder,
} from "./order.controller.js";

const router = Router();

/*
 * Comenzile cumpărătorului
 *
 * GET /orders
 */
router.get(
  "/",
  auth,
  getMyOrders,
);

/*
 * Comenzile unde utilizatorul este vânzător
 *
 * GET /orders/selling
 */
router.get(
  "/selling",
  auth,
  getMySellingOrders,
);

/*
 * Comenzile finalizate ale cumpărătorului
 *
 * GET /orders/completed
 */
router.get(
  "/completed",
  auth,
  getCompletedOrders,
);

/*
 * O comandă individuală
 *
 * GET /orders/:id
 */
router.get(
  "/:id",
  auth,
  getOrder,
);

export default router;