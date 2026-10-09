// backend/modules/sameday/sameday-shipment.routes.ts

import {
  Router,
} from "express";

import auth from "../../middleware/auth.js";

import {
  samedayShipmentController,
} from "./sameday-shipment.controller.ts.js";

const router =
  Router();

// ============================================================
// CREATE SAMEDAY EASYBOX SHIPMENT
// ============================================================

/**
 * Generează AWB-ul Sameday pentru o comandă Easybox.
 *
 * IMPORTANT:
 *
 * - Easybox-ul a fost deja ales de cumpărător la checkout.
 * - destinationLockerId este salvat în Order.
 * - destinationLockerId NU se mai trimite în acest request.
 * - Numai vânzătorul comenzii poate genera AWB-ul.
 *
 * POST
 * /sameday/shipments/orders/:orderId
 *
 * Body:
 *
 * {
 *   "packageType": 0,
 *   "packageWeight": 1.2,
 *   "width": 25,
 *   "length": 35,
 *   "height": 15
 * }
 *
 * packageType:
 *
 * 0 = colet standard
 * 1 = colet mic
 * 2 = colet oversized
 *
 * width / length / height sunt opționale.
 *
 * packageWeight este obligatoriu.
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
 * Returnează transporturile pentru produsele
 * vândute de utilizatorul autentificat.
 *
 * GET
 * /sameday/shipments/selling
 *
 * Folosit în aplicația vânzătorului pentru:
 *
 * - AWB number
 * - PDF AWB
 * - Easybox destinație
 * - status transport
 * - greutate / dimensiuni
 *
 * Flow standard actual:
 *
 * seller
 *   ↓
 * generează AWB
 *   ↓
 * descarcă PDF
 *   ↓
 * printează eticheta
 *   ↓
 * lipește eticheta pe colet
 *   ↓
 * depune coletul în Easybox
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
 * Returnează transporturile cumpărătorului.
 *
 * GET
 * /sameday/shipments/buying
 *
 * Folosit pentru:
 *
 * - Easybox destinație
 * - AWB
 * - status colet
 * - tracking
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
 * Returnează transportul unei comenzi.
 *
 * Acces:
 *
 * - cumpărătorul comenzii
 * - vânzătorul comenzii
 *
 * GET
 * /sameday/shipments/orders/:orderId
 */
router.get(
  "/orders/:orderId",

  auth,

  samedayShipmentController
    .getShipmentByOrder,
);

// ============================================================
// EXPORT
// ============================================================

export default router;