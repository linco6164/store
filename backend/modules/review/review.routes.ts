import { Router } from "express";
import auth from "../../middleware/auth.js";
import {
  createReview,
  getSellerReviews,
  getSellerReviewSummary,
  deleteReview,
} from "./review.controller.js";

const router = Router();

/*
 * Creează o evaluare pentru o comandă finalizată
 *
 * POST /reviews
 * Body:
 * {
 *   orderId: string,
 *   rating: number,
 *   comment?: string
 * }
 */
router.post(
  "/",
  auth,
  createReview,
);

/*
 * Toate evaluările unui vânzător
 *
 * GET /reviews/seller/:sellerId
 */
router.get(
  "/seller/:sellerId",
  getSellerReviews,
);

/*
 * Sumar evaluări vânzător
 *
 * GET /reviews/seller/:sellerId/summary
 */
router.get(
  "/seller/:sellerId/summary",
  getSellerReviewSummary,
);

/*
 * Șterge propria evaluare
 *
 * DELETE /reviews/:id
 */
router.delete(
  "/:id",
  auth,
  deleteReview,
);

export default router;