// backend/modules/sameday/sameday-shipment.controller.ts

import { Response } from "express";
import mongoose from "mongoose";

import type {
  AuthRequest,
} from "../../middleware/auth.js";

import Order from "../order/order.model.js";

import {
  samedayShipmentService,
} from "./sameday-shipment.service.js";

// ============================================================
// HELPERS
// ============================================================

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "UNKNOWN_ERROR";
}

function parsePositiveNumber(
  value: unknown,
): number | undefined {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return undefined;
  }

  const parsed = Number(value);

  if (
    !Number.isFinite(parsed) ||
    parsed <= 0
  ) {
    return undefined;
  }

  return parsed;
}

function parsePackageType(
  value: unknown,
): 0 | 1 | 2 {
  const parsed = Number(value);

  if (
    parsed === 0 ||
    parsed === 1 ||
    parsed === 2
  ) {
    return parsed;
  }

  return 0;
}

function statusForError(
  code: string,
): number {
  switch (code) {
    case "ORDER_NOT_FOUND":
    case "SHIPMENT_NOT_FOUND":
    case "BUYER_NOT_FOUND":
    case "SELLER_NOT_FOUND":
    case "LISTING_NOT_FOUND":
    case "DESTINATION_LOCKER_NOT_FOUND":
      return 404;

    case "FORBIDDEN":
      return 403;

    case "ORDER_NOT_PAID":
    case "ORDER_NOT_SHIPPABLE":
      return 409;

    case "INVALID_DESTINATION_LOCKER":
    case "INVALID_PACKAGE_WEIGHT":
    case "INVALID_PACKAGE_TYPE":
    case "BUYER_PHONE_REQUIRED":
    case "BUYER_EMAIL_REQUIRED":
    case "DESTINATION_NOT_EASYBOX":
      return 400;

    case "SAMEDAY_LOCKER_NEXTDAY_NOT_ENABLED":
    case "SAMEDAY_PDO_NOT_ENABLED_FOR_LOCKER_NEXTDAY":
    case "SAMEDAY_PDO_ID_INVALID":
      return 503;

    default:
      return 500;
  }
}

// ============================================================
// CONTROLLER
// ============================================================

export const samedayShipmentController = {
  // ==========================================================
  // CREATE LOCKER SHIPMENT
  //
  // Cumpărătorul alege Easybox-ul.
  // AWB-ul este generat pentru comanda sa.
  // ==========================================================

  async createLockerShipment(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message:
            "Nu ești autentificat.",
        });
      }

      const orderId =
        String(
          req.params.orderId ?? "",
        ).trim();

      if (
        !mongoose.isValidObjectId(
          orderId,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "ID-ul comenzii nu este valid.",
        });
      }

      // ======================================================
      // VERIFICĂM DACĂ ESTE COMANDA CUMPĂRĂTORULUI
      // ======================================================

      const order =
        await Order.findById(
          orderId,
        ).select(
          "_id buyer seller status",
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Comanda nu a fost găsită.",
        });
      }

      if (
        order.buyer.toString() !==
        req.userId
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Nu ai acces la această comandă.",
        });
      }

      // ======================================================
      // BODY
      // ======================================================

      const destinationLockerId =
        Number(
          req.body
            ?.destinationLockerId,
        );

      if (
        !Number.isInteger(
          destinationLockerId,
        ) ||
        destinationLockerId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Easybox-ul selectat nu este valid.",
        });
      }

      const packageWeight =
        Number(
          req.body
            ?.packageWeight,
        );

      if (
        !Number.isFinite(
          packageWeight,
        ) ||
        packageWeight <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Greutatea coletului nu este validă.",
        });
      }

      const packageType =
        parsePackageType(
          req.body?.packageType,
        );

      const width =
        parsePositiveNumber(
          req.body?.width,
        );

      const length =
        parsePositiveNumber(
          req.body?.length,
        );

      const height =
        parsePositiveNumber(
          req.body?.height,
        );

      // ======================================================
      // CREATE SHIPMENT
      // ======================================================

      const shipment =
        await samedayShipmentService
          .createLockerShipment({
            orderId,

            destinationLockerId,

            packageType,

            packageWeight,

            width,

            length,

            height,
          });

      return res.status(201).json({
        success: true,

        message:
          "Transportul Sameday a fost creat.",

        data: shipment,
      });
    } catch (error) {
      console.error(
        "SAMEDAY CREATE SHIPMENT ERROR:",
        error,
      );

      const code =
        getErrorMessage(error);

      return res
        .status(
          statusForError(code),
        )
        .json({
          success: false,

          message:
            getPublicErrorMessage(
              code,
            ),

          error: code,
        });
    }
  },

  // ==========================================================
  // MY SELLING SHIPMENTS
  //
  // Transporturile comenzilor pe care utilizatorul
  // trebuie să le expedieze.
  // ==========================================================

  async getMySellingShipments(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message:
            "Nu ești autentificat.",
        });
      }

      const shipments =
        await samedayShipmentService
          .getSellerShipments(
            req.userId,
          );

      return res.json({
        success: true,
        data: shipments,
      });
    } catch (error) {
      console.error(
        "SAMEDAY SELLER SHIPMENTS ERROR:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Nu am putut încărca expedierile.",
      });
    }
  },

  // ==========================================================
  // MY BUYING SHIPMENTS
  //
  // Transporturile coletelor pe care utilizatorul
  // urmează să le primească.
  // ==========================================================

  async getMyBuyingShipments(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message:
            "Nu ești autentificat.",
        });
      }

      const shipments =
        await samedayShipmentService
          .getBuyerShipments(
            req.userId,
          );

      return res.json({
        success: true,
        data: shipments,
      });
    } catch (error) {
      console.error(
        "SAMEDAY BUYER SHIPMENTS ERROR:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Nu am putut încărca livrările.",
      });
    }
  },

  // ==========================================================
  // GET SHIPMENT BY ORDER
  // ==========================================================

  async getShipmentByOrder(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message:
            "Nu ești autentificat.",
        });
      }

      const orderId =
        String(
          req.params.orderId ?? "",
        ).trim();

      if (
        !mongoose.isValidObjectId(
          orderId,
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "ID-ul comenzii nu este valid.",
        });
      }

      const shipment =
        await samedayShipmentService
          .getShipmentByOrder(
            orderId,
          );

      // ======================================================
      // BUYER SAU SELLER
      // ======================================================

      const isBuyer =
        shipment.buyer.toString() ===
        req.userId;

      const isSeller =
        shipment.seller.toString() ===
        req.userId;

      if (
        !isBuyer &&
        !isSeller
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Nu ai acces la acest transport.",
        });
      }

      return res.json({
        success: true,
        data: shipment,
      });
    } catch (error) {
      console.error(
        "SAMEDAY GET SHIPMENT ERROR:",
        error,
      );

      const code =
        getErrorMessage(error);

      return res
        .status(
          statusForError(code),
        )
        .json({
          success: false,

          message:
            getPublicErrorMessage(
              code,
            ),

          error: code,
        });
    }
  },
};

// ============================================================
// PUBLIC ERROR MESSAGES
// ============================================================

function getPublicErrorMessage(
  code: string,
): string {
  switch (code) {
    case "ORDER_NOT_FOUND":
      return "Comanda nu a fost găsită.";

    case "ORDER_NOT_PAID":
      return "Comanda nu este plătită.";

    case "ORDER_NOT_SHIPPABLE":
      return "Această comandă nu poate fi expediată.";

    case "BUYER_NOT_FOUND":
      return "Cumpărătorul nu a fost găsit.";

    case "SELLER_NOT_FOUND":
      return "Vânzătorul nu a fost găsit.";

    case "LISTING_NOT_FOUND":
      return "Anunțul nu a fost găsit.";

    case "BUYER_PHONE_REQUIRED":
      return "Cumpărătorul trebuie să aibă un număr de telefon.";

    case "BUYER_EMAIL_REQUIRED":
      return "Cumpărătorul trebuie să aibă o adresă de email.";

    case "INVALID_DESTINATION_LOCKER":
    case "DESTINATION_LOCKER_NOT_FOUND":
      return "Easybox-ul selectat nu este valid.";

    case "DESTINATION_NOT_EASYBOX":
      return "Locația selectată nu este un Easybox.";

    case "INVALID_PACKAGE_WEIGHT":
      return "Greutatea coletului nu este validă.";

    case "SAMEDAY_LOCKER_NEXTDAY_NOT_ENABLED":
      return "Serviciul Sameday Locker NextDay nu este activ.";

    case "SAMEDAY_PDO_NOT_ENABLED_FOR_LOCKER_NEXTDAY":
      return "Predarea personală în Easybox nu este încă activată pe contul Sameday.";

    case "SAMEDAY_PDO_ID_INVALID":
      return "Configurația PDO Sameday nu este validă.";

    case "SHIPMENT_NOT_FOUND":
      return "Transportul nu a fost găsit.";

    default:
      return "A apărut o eroare la procesarea transportului Sameday.";
  }
}