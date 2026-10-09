// backend/modules/sameday/sameday.routes.ts

import { Router } from "express";

import auth from "../../middleware/auth.js";
import staffAccess from "../../middleware/staffAccess.js";

import {
  samedayController,
} from "./sameday.controller.js";

const router = Router();

// ============================================================
// USER ROUTES
// ============================================================

/**
 * Lista județelor Sameday.
 *
 * GET /sameday/counties
 */
router.get(
  "/counties",
  auth,
  samedayController.getCounties,
);

/**
 * Lista localităților Sameday.
 *
 * GET /sameday/cities
 *
 * Query example:
 * ?county=Calarași
 */
router.get(
  "/cities",
  auth,
  samedayController.getCities,
);

/**
 * Lista locațiilor OOH:
 * - Easybox
 * - PUDO / Sameday Point
 *
 * GET /sameday/ooh-locations
 *
 * listingType:
 * 0 = doar Easybox
 * 1 = Easybox + PUDO
 */
router.get(
  "/ooh-locations",
  auth,
  samedayController.getOohLocations,
);

// ============================================================
// STAFF / ADMIN ROUTES
// ============================================================

/**
 * Test conexiune Sameday.
 *
 * GET /sameday/internal/test
 */
router.get(
  "/internal/test",
  auth,
  staffAccess,
  samedayController.testConnection,
);

/**
 * Pickup points ale contului Nexora.
 *
 * GET /sameday/internal/pickup-points
 */
router.get(
  "/internal/pickup-points",
  auth,
  staffAccess,
  samedayController.getPickupPoints,
);

/**
 * Serviciile active pe contractul Sameday.
 *
 * GET /sameday/internal/services
 */
router.get(
  "/internal/services",
  auth,
  staffAccess,
  samedayController.getServices,
);

/**
 * Caută AWB după clientInternalReference.
 *
 * GET /sameday/internal/awb/:reference
 */
router.get(
  "/internal/awb/:reference",
  auth,
  staffAccess,
  samedayController.getAwbByReference,
);

/**
 * Status sync pentru expedieri locale.
 *
 * GET /sameday/internal/status-sync
 *
 * Query:
 * startTimestamp
 * endTimestamp
 */
router.get(
  "/internal/status-sync",
  auth,
  staffAccess,
  samedayController.getStatusSync,
);

export default router;