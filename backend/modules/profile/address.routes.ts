import { Router } from "express";

import auth from "../../middleware/auth.js";

import { addressController } from "./address.contoller.js";

const router = Router();

router.get(
  "/",
  auth,
  addressController.list,
);

router.post(
  "/",
  auth,
  addressController.create,
);

router.patch(
  "/:id",
  auth,
  addressController.update,
);

router.delete(
  "/:id",
  auth,
  addressController.delete,
);

router.patch(
  "/:id/default",
  auth,
  addressController.setDefault,
);

export default router;