import { Router } from "express";
import auth from "../../middleware/auth.js";
import {
  getPackages,
  createPromotion,
  getMyPromotions,
  getListingPromotions,
  getActivePromotion,
} from "./promotion.controller.js";

const router = Router();

// Pachetele disponibile
router.get(
  "/packages",
  getPackages,
);

// Creează o promovare
router.post(
  "/",
  auth,
  createPromotion,
);

// Promovările utilizatorului autentificat
router.get(
  "/mine",
  auth,
  getMyPromotions,
);

// Istoricul promovărilor unui anunț
router.get(
  "/listing/:listingId",
  auth,
  getListingPromotions,
);

// Verifică promovarea activă a unui anunț
router.get(
  "/active/:listingId",
  getActivePromotion,
);

export default router;