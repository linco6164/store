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

  const parsed =
    Number(value);

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
  const parsed =
    Number(value);

  if (
    parsed === 0 ||
    parsed === 1 ||
    parsed === 2
  ) {
    return parsed;
  }

  return 0;
}

// ============================================================
// HTTP STATUS FROM INTERNAL ERROR
// ============================================================

function statusForError(
  code: string,
): number {
  switch (code) {
    // ========================================================
    // NOT FOUND
    // ========================================================

    case "ORDER_NOT_FOUND":
    case "SHIPMENT_NOT_FOUND":
    case "BUYER_NOT_FOUND":
    case "SELLER_NOT_FOUND":
    case "LISTING_NOT_FOUND":
    case "DESTINATION_LOCKER_NOT_FOUND":
      return 404;

    // ========================================================
    // FORBIDDEN
    // ========================================================

    case "FORBIDDEN":
      return 403;

    // ========================================================
    // CONFLICT
    // ========================================================

    case "ORDER_NOT_PAID":
    case "ORDER_NOT_SHIPPABLE":
    case "ORDER_NOT_EASYBOX_DELIVERY":
    case "ORDER_EASYBOX_MISSING":
      return 409;

    // ========================================================
    // BAD REQUEST
    // ========================================================

    case "INVALID_PACKAGE_WEIGHT":
    case "INVALID_PACKAGE_TYPE":
    case "BUYER_PHONE_REQUIRED":
    case "BUYER_EMAIL_REQUIRED":
    case "DESTINATION_NOT_EASYBOX":
      return 400;

    // ========================================================
    // SAMEDAY CONFIG / SERVICE
    // ========================================================

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
  // Easybox-ul NU mai este primit din request.
  //
  // El este deja salvat în Order în momentul checkout-ului.
  //
  // AWB-ul este creat de vânzător, deoarece vânzătorul:
  // - pregătește coletul
  // - cunoaște greutatea
  // - cunoaște dimensiunile
  // - descarcă/printează AWB-ul
  // ==========================================================

  async createLockerShipment(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      // ======================================================
      // AUTH
      // ======================================================

      if (!req.userId) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Nu ești autentificat.",
          });
      }

      // ======================================================
      // ORDER ID
      // ======================================================

      const orderId =
        String(
          req.params
            .orderId ?? "",
        ).trim();

      if (
        !mongoose
          .isValidObjectId(
            orderId,
          )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "ID-ul comenzii nu este valid.",
          });
      }

      // ======================================================
      // LOAD ORDER
      // ======================================================

      const order =
        await Order
          .findById(
            orderId,
          )
          .select(
            [
              "_id",
              "buyer",
              "seller",
              "status",
              "deliveryMethod",
              "destinationLockerId",
            ].join(" "),
          );

      if (!order) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Comanda nu a fost găsită.",
          });
      }

      // ======================================================
      // SELLER ACCESS
      // ======================================================

      /**
       * Numai vânzătorul generează AWB-ul.
       *
       * Cumpărătorul doar alege Easybox-ul în checkout.
       */

      if (
        order.seller
          .toString() !==
        req.userId
      ) {
        return res
          .status(403)
          .json({
            success: false,

            message:
              "Doar vânzătorul poate genera transportul acestei comenzi.",
          });
      }

      // ======================================================
      // ORDER STATUS
      // ======================================================

      if (
        order.status !==
          "paid" &&
        order.status !==
          "processing"
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "Comanda nu este pregătită pentru expediere.",
          });
      }

      // ======================================================
      // DELIVERY METHOD
      // ======================================================

      if (
        order.deliveryMethod !==
        "pickup_point"
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "Această comandă nu are livrare prin Easybox.",
          });
      }

      // ======================================================
      // EASYBOX FROM ORDER
      // ======================================================

      const destinationLockerId =
        Number(
          order
            .destinationLockerId,
        );

      if (
        !Number.isInteger(
          destinationLockerId,
        ) ||
        destinationLockerId <= 0
      ) {
        return res
          .status(409)
          .json({
            success: false,

            message:
              "Comanda nu are un Easybox de destinație valid.",
          });
      }

      // ======================================================
      // PACKAGE WEIGHT
      // ======================================================

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
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Greutatea coletului nu este validă.",
          });
      }

      // ======================================================
      // PACKAGE TYPE
      // ======================================================

      const packageType =
        parsePackageType(
          req.body
            ?.packageType,
        );

      // ======================================================
      // DIMENSIONS
      // ======================================================

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

            /**
             * Nu vine din req.body.
             *
             * Vine exclusiv din Order.
             *
             * Momentan îl trimitem către service pentru
             * compatibilitate cu interfața existentă.
             */
            destinationLockerId,

            packageType,

            packageWeight,

            width,

            length,

            height,
          });

      // ======================================================
      // RESPONSE
      // ======================================================

      return res
        .status(201)
        .json({
          success: true,

          message:
            "Transportul Sameday a fost creat.",

          data:
            shipment,
        });
    } catch (error) {
      console.error(
        "SAMEDAY CREATE SHIPMENT ERROR:",
        error,
      );

      const code =
        getErrorMessage(
          error,
        );

      return res
        .status(
          statusForError(
            code,
          ),
        )
        .json({
          success:
            false,

          message:
            getPublicErrorMessage(
              code,
            ),

          error:
            code,
        });
    }
  },

  // ==========================================================
  // MY SELLING SHIPMENTS
  // ==========================================================

  async getMySellingShipments(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res
          .status(401)
          .json({
            success:
              false,

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
        success:
          true,

        data:
          shipments,
      });
    } catch (error) {
      console.error(
        "SAMEDAY SELLER SHIPMENTS ERROR:",
        error,
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Nu am putut încărca expedierile.",
        });
    }
  },

  // ==========================================================
  // MY BUYING SHIPMENTS
  // ==========================================================

  async getMyBuyingShipments(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res
          .status(401)
          .json({
            success:
              false,

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
        success:
          true,

        data:
          shipments,
      });
    } catch (error) {
      console.error(
        "SAMEDAY BUYER SHIPMENTS ERROR:",
        error,
      );

      return res
        .status(500)
        .json({
          success:
            false,

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
        return res
          .status(401)
          .json({
            success:
              false,

            message:
              "Nu ești autentificat.",
          });
      }

      const orderId =
        String(
          req.params
            .orderId ?? "",
        ).trim();

      if (
        !mongoose
          .isValidObjectId(
            orderId,
          )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

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
      // BUYER OR SELLER ACCESS
      // ======================================================

      const isBuyer =
        shipment.buyer
          .toString() ===
        req.userId;

      const isSeller =
        shipment.seller
          .toString() ===
        req.userId;

      if (
        !isBuyer &&
        !isSeller
      ) {
        return res
          .status(403)
          .json({
            success:
              false,

            message:
              "Nu ai acces la acest transport.",
          });
      }

      return res.json({
        success:
          true,

        data:
          shipment,
      });
    } catch (error) {
      console.error(
        "SAMEDAY GET SHIPMENT ERROR:",
        error,
      );

      const code =
        getErrorMessage(
          error,
        );

      return res
        .status(
          statusForError(
            code,
          ),
        )
        .json({
          success:
            false,

          message:
            getPublicErrorMessage(
              code,
            ),

          error:
            code,
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

    case "ORDER_NOT_EASYBOX_DELIVERY":
      return "Această comandă nu are livrare prin Easybox.";

    case "ORDER_EASYBOX_MISSING":
      return "Comanda nu are un Easybox de destinație valid.";

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

    case "DESTINATION_LOCKER_NOT_FOUND":
      return "Easybox-ul de destinație nu mai este disponibil.";

    case "DESTINATION_NOT_EASYBOX":
      return "Locația selectată nu este un Easybox.";

    case "INVALID_PACKAGE_WEIGHT":
      return "Greutatea coletului nu este validă.";

    case "INVALID_PACKAGE_TYPE":
      return "Tipul coletului nu este valid.";

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