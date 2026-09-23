import { Router } from "express";
import auth from "../../middleware/auth.js";
import { savedCardController } from "./saved-card.controller.js";

const router = Router();

// Cardurile utilizatorului
router.get(
  "/",
  auth,
  savedCardController.list,
);

// Adăugare card
router.post(
  "/",
  auth,
  savedCardController.create,
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