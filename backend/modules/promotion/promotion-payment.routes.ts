import { Router } from "express";

import auth from "../../middleware/auth.js";

import {
  createPromotionPaymentController,
  getPromotionPaymentController,
  confirmPromotionPayment,
  promotionPaymentReturn,
  promotionPaymentCheckout,
} from "./promotion-payment.controller.js";

const router = Router();

/**
 * Creează plata pentru o promovare.
 * Protejat - utilizator autentificat.
 */
router.post("/create", auth, createPromotionPaymentController);

/**
 * NETOPIA IPN / confirm.
 *
 * IMPORTANT:
 * Nu folosim auth deoarece NETOPIA
 * apelează direct acest endpoint.
 */
router.post("/confirm", confirmPromotionPayment);

/**
 * Return URL după checkout NETOPIA.
 */
router.get("/return", promotionPaymentReturn);

router.get("/checkout", promotionPaymentCheckout);

/**
 * Detaliile unei plăți.
 * Protejat - utilizator autentificat.
 */
router.get("/:id", auth, getPromotionPaymentController);

export default router;
