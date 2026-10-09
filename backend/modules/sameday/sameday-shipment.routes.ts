// backend/modules/sameday/sameday-shipment.routes.ts

import { Router } from "express";

import auth from "../../middleware/auth.js";

import {
  samedayShipmentController,
} from "./sameday-shipment.controller.ts.js";

const router = Router();

// ============================================================
// CREATE SHIPMENT
// ============================================================

/**
 * Creează transportul Sameday pentru o comandă.
 *
 * Cumpărătorul trebuie:
 * - să fie autentificat
 * - să fie proprietarul comenzii
 * - să fi ales Easybox-ul
 * - comanda să fie plătită
 *
 * POST /sameday/shipments/orders/:orderId
 *
 * Body:
 * {
 *   "destinationLockerId": 12345,
 *   "packageType": 0,
 *   "packageWeight": 1,
 *   "width": 20,
 *   "length": 30,
 *   "height": 10
 * }
 */
router.post(
  "/orders/:orderId",
  auth,
  samedayShipmentController
    .createLockerShipment,
);

// ============================================================
// SELLER SHIPMENTS
// ============================================================

/**
 * Expedierile pentru produsele vândute de utilizator.
 *
 * Aici vânzătorul va vedea:
 * - AWB
 * - PDF AWB
 * - Easybox destinație
 * - status
 *
 * Mai târziu:
 * - QR / PIN label-free dacă Sameday îl activează
 *
 * GET /sameday/shipments/selling
 */
router.get(
  "/selling",
  auth,
  samedayShipmentController
    .getMySellingShipments,
);

// ============================================================
// BUYER SHIPMENTS
// ============================================================

/**
 * Livrările cumpărătorului.
 *
 * GET /sameday/shipments/buying
 */
router.get(
  "/buying",
  auth,
  samedayShipmentController
    .getMyBuyingShipments,
);

// ============================================================
// SHIPMENT BY ORDER
// ============================================================

/**
 * Transportul asociat unei anumite comenzi.
 *
 * Acces:
 * - cumpărător
 * - vânzător
 *
 * GET /sameday/shipments/orders/:orderId
 */
router.get(
  "/orders/:orderId",
  auth,
  samedayShipmentController
    .getShipmentByOrder,
);

export default router;