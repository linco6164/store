import { Router } from "express";

import auth from "../../middleware/auth.js";
import { paymentController } from "./payment.controller.js";

const router = Router();

router.post(
  "/netopia/create",
  auth,
  paymentController.createNetopia,
);

router.get(
  "/netopia/checkout/:id",
  paymentController.checkout,
);

router.post(
  "/netopia/confirm",
  paymentController.confirm,
);

router.get(
  "/netopia/return",
  paymentController.returnPage,
);

router.get(
  "/:id",
  auth,
  paymentController.getPayment,
);

export default router;
