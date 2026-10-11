import { Router } from "express";

import auth from "../../middleware/auth.js";
import { paymentController } from "./payment.controller.js";
import { googlePayController } from "./google-pay.controller.js";

const router = Router();

router.get(
  "/google-pay/config",
  auth,
  googlePayController.configuration,
);

router.post(
  "/google-pay/complete",
  auth,
  googlePayController.complete,
);

router.get(
  "/google-pay/action/:id",
  googlePayController.action,
);

router.get(
  "/google-pay/3ds-return/:id",
  googlePayController.threeDsReturn,
);

router.post(
  "/google-pay/3ds-return/:id",
  googlePayController.threeDsReturn,
);

router.post(
  "/google-pay/notify",
  googlePayController.notify,
);

/**
 * Creează o plată NETOPIA pentru checkout.
 *
 * POST /payments/netopia/create
 *
 * Body:
 * {
 *   listingId,
 *   addressId,
 *   deliveryMethod,
 *   paymentMethod,
 *   savedCardId?
 * }
 */
router.post(
  "/netopia/create",
  auth,
  paymentController.createNetopia,
);

/**
 * Deschide formularul/gateway-ul NETOPIA.
 *
 * GET /payments/netopia/checkout/:id
 */
router.get(
  "/netopia/checkout/:id",
  paymentController.checkout,
);

/**
 * Confirmarea trimisă de NETOPIA către backend.
 *
 * POST /payments/netopia/confirm
 */
router.post(
  "/netopia/confirm",
  paymentController.confirm,
);

/**
 * Return URL după plata NETOPIA.
 *
 * GET /payments/netopia/return
 */
router.get(
  "/netopia/return",
  paymentController.returnPage,
);

/**
 * Statusul unei plăți.
 *
 * GET /payments/:id
 */
router.get(
  "/:id",
  auth,
  paymentController.getPayment,
);

export default router;
