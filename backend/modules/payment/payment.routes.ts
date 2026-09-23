import { Router } from "express";

import auth from "../../middleware/auth.js";
import { paymentController } from "./payment.controller.js";

const router = Router();

// ============================================================
// CREATE NETOPIA PAYMENT
// ============================================================

router.post(
  "/netopia/create",
  auth,
  paymentController.createNetopia,
);

// ============================================================
// NETOPIA CHECKOUT
// ============================================================
//
// Această rută este accesată fără auth deoarece utilizatorul
// este deja identificat prin paymentId.
// ============================================================

router.get(
  "/netopia/checkout/:id",
  paymentController.checkout,
);

// ============================================================
// NETOPIA CONFIRM
// ============================================================
//
// NETOPIA apelează această rută de pe server.
// Nu punem middleware-ul auth aici.
// ============================================================

router.post(
  "/netopia/confirm",
  paymentController.confirm,
);

// ============================================================
// NETOPIA RETURN
// ============================================================

router.get(
  "/netopia/return",
  paymentController.returnPage,
);

// ============================================================
// GET PAYMENT
// ============================================================

router.get(
  "/:id",
  auth,
  paymentController.getPayment,
);

export default router;