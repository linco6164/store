import { Router } from "express";
import auth from "../../middleware/auth.js";
import { savedCardController } from "./saved-card.controller.js";
import { cardSetupController } from "./card-setup.controller.js";

const router = Router();

router.post("/setup", auth, cardSetupController.create);

router.get("/setup/checkout/:id", cardSetupController.checkout);

router.get("/setup/:id/status", auth, cardSetupController.status);

router.post("/setup/confirm", cardSetupController.confirm);

router.get("/setup/return", cardSetupController.returnPage);

// Cardurile utilizatorului
router.get(
  "/",
  auth,
  savedCardController.list,
);

// Setare card implicit
router.patch(
  "/:id/default",
  auth,
  savedCardController.setDefault,
);

// Ștergere card
router.delete(
  "/:id",
  auth,
  savedCardController.remove,
);

export default router;
