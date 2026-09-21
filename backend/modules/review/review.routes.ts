import { Router } from "express";

import * as reviewController from "./review.controller.js";
import  auth  from "../../middleware/auth.js";

const router = Router();

// Evaluări publice
router.get(
  "/seller/:sellerId",
  reviewController.sellerReviews,
);

router.get(
  "/seller/:sellerId/summary",
  reviewController.sellerSummary,
);

// Creare evaluare
router.post(
  "/",
  auth,
  reviewController.create,
);

// Ștergere evaluare proprie
router.delete(
  "/:id",
  auth,
  reviewController.remove,
);

export default router;