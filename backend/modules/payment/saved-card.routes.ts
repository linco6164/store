import { Router } from "express";

import  auth  from "../../middleware/auth.js";

import {
  getCards,
  makeDefaultCard,
  removeCard,
} from "./saved-card.controller.js";

const router = Router();

router.get(
  "/",
  auth,
  getCards,
);

router.patch(
  "/:id/default",
  auth,
  makeDefaultCard,
);

router.delete(
  "/:id",
  auth,
  removeCard,
);

export default router;