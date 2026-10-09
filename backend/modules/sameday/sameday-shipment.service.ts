// backend/modules/sameday/sameday-shipment.service.ts

import crypto from "crypto";
import mongoose from "mongoose";

import Order from "../order/order.model.js";
import User from "../../models/Users.js";
import { ListingModel } from "../listing/listing.model.js";

import SamedayShipmentModel from "./sameday-shipment.model.js";

import {
  samedayService,
} from "./sameday.service.js";

import type {
  SamedayCreateAwbPayload,
  SamedayOohLocation,
  SamedayPackageType,
} from "./sameday.types.js";

// ============================================================
// TYPES
// ============================================================

interface CreateLockerShipmentInput {
  orderId: string;

  destinationLockerId: number;

  packageType?: SamedayPackageType;

  packageWeight: number;

  width?: number;

  length?: number;

  height?: number;
}

// ============================================================
// HELPERS
// ============================================================

function requiredNumberEnv(
  name: string,
): number {
  const value =
    process.env[name];

  if (
    !value ||
    !value.trim()
  ) {
    throw new Error(
      `${name}_MISSING`,
    );
  }

  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    throw new Error(
      `${name}_INVALID`,
    );
  }

  return parsed;
}

function normalizeName(
  fullName: unknown,
  username: unknown,
): string {
  const name =
    String(
      fullName ?? "",
    ).trim();

  if (name) {
    return name;
  }

  const fallback =
    String(
      username ?? "",
    ).trim();

  return (
    fallback ||
    "Utilizator Nexora"
  );
}

function normalizePhone(
  value: unknown,
): string {
  return String(
    value ?? "",
  )
    .trim()
    .replace(/\s+/g, "");
}

function generateInternalReference(
  orderId: string,
): string {
  return (
    `NX-SD-` +
    `${orderId}-` +
    crypto
      .randomBytes(5)
      .toString("hex")
      .toUpperCase()
  );
}

// ============================================================
// SERVICE
// ============================================================

class SamedayShipmentService {
  // ==========================================================
  // CREATE LOCKER NEXTDAY SHIPMENT
  // ==========================================================

  async createLockerShipment(
    input: CreateLockerShipmentInput,
  ) {
    // ========================================================
    // VALIDATE ORDER ID
    // ========================================================

    if (
      !mongoose.isValidObjectId(
        input.orderId,
      )
    ) {
      throw new Error(
        "ORDER_NOT_FOUND",
      );
    }

    if (
      !Number.isInteger(
        input.destinationLockerId,
      ) ||
      input.destinationLockerId <= 0
    ) {
      throw new Error(
        "INVALID_DESTINATION_LOCKER",
      );
    }

    if (
      !Number.isFinite(
        input.packageWeight,
      ) ||
      input.packageWeight <= 0
    ) {
      throw new Error(
        "INVALID_PACKAGE_WEIGHT",
      );
    }

    const packageType =
      input.packageType ?? 0;

    if (
      packageType !== 0 &&
      packageType !== 1 &&
      packageType !== 2
    ) {
      throw new Error(
        "INVALID_PACKAGE_TYPE",
      );
    }

    // ========================================================
    // IDEMPOTENCY
    //
    // Nu generăm două AWB-uri pentru aceeași comandă.
    // ========================================================

    const existingShipment =
      await SamedayShipmentModel
        .findOne({
          order: input.orderId,
        });

    if (existingShipment) {
      return existingShipment;
    }

    // ========================================================
    // ORDER
    // ========================================================

    const order =
      await Order.findById(
        input.orderId,
      );

    if (!order) {
      throw new Error(
        "ORDER_NOT_FOUND",
      );
    }

    if (
      order.status ===
        "cancelled" ||
      order.status ===
        "refunded"
    ) {
      throw new Error(
        "ORDER_NOT_SHIPPABLE",
      );
    }

    // AWB-ul trebuie generat numai
    // pentru o comandă deja plătită.
    if (
      order.status !== "paid" &&
      order.status !== "processing"
    ) {
      throw new Error(
        "ORDER_NOT_PAID",
      );
    }

    // ========================================================
    // USERS + LISTING
    // ========================================================

    const [
      buyer,
      seller,
      listing,
    ] =
      await Promise.all([
        User.findById(
          order.buyer,
        ),

        User.findById(
          order.seller,
        ),

        ListingModel.findById(
          order.listing,
        ),
      ]);

    if (!buyer) {
      throw new Error(
        "BUYER_NOT_FOUND",
      );
    }

    if (!seller) {
      throw new Error(
        "SELLER_NOT_FOUND",
      );
    }

    if (!listing) {
      throw new Error(
        "LISTING_NOT_FOUND",
      );
    }

    // ========================================================
    // BUYER CONTACT
    // ========================================================

    const buyerPhone =
      normalizePhone(
        buyer.phone,
      );

    if (!buyerPhone) {
      throw new Error(
        "BUYER_PHONE_REQUIRED",
      );
    }

    if (
      !buyer.email ||
      !buyer.email.trim()
    ) {
      throw new Error(
        "BUYER_EMAIL_REQUIRED",
      );
    }

    // ========================================================
    // VERIFY DESTINATION EASYBOX
    //
    // Nu avem încredere într-un ID trimis pur și simplu
    // de Flutter.
    //
    // Îl verificăm direct în API-ul Sameday.
    // ========================================================

    const lockerResponse =
      await samedayService
        .getOohLocations({
          listingType: 0,

          oohList:
            String(
              input.destinationLockerId,
            ),

          countryCode: "RO",

          page: 1,

          countPerPage: 100,
        });

    const destinationLocker:
      SamedayOohLocation | undefined =
      lockerResponse.data.find(
        (location) =>
          Number(
            location.oohId,
          ) ===
          input.destinationLockerId,
      );

    if (!destinationLocker) {
      throw new Error(
        "DESTINATION_LOCKER_NOT_FOUND",
      );
    }

    if (
      destinationLocker.oohType !== 0
    ) {
      throw new Error(
        "DESTINATION_NOT_EASYBOX",
      );
    }

    // ========================================================
    // VERIFY LOCKER NEXTDAY SERVICE
    // ========================================================

    const services =
      await samedayService
        .getServices(
          1,
          500,
        );

    const lockerService =
      services.data.find(
        (service) =>
          Number(
            service.id,
          ) === 15,
      );

    if (!lockerService) {
      throw new Error(
        "SAMEDAY_LOCKER_NEXTDAY_NOT_ENABLED",
      );
    }

    // ========================================================
    // PDO
    //
    // Pentru predare personală în Easybox,
    // căutăm PDO pentru packageType-ul folosit.
    // ========================================================

    const pdoTax =
      lockerService
        .serviceOptionalTaxes
        ?.find(
          (tax) =>
            String(
              tax.taxCode ??
                tax.code ??
                "",
            ).toUpperCase() ===
              "PDO" &&
            Number(
              tax.packageType,
            ) ===
              packageType,
        );

    if (!pdoTax) {
      throw new Error(
        "SAMEDAY_PDO_NOT_ENABLED_FOR_LOCKER_NEXTDAY",
      );
    }

    const pdoTaxId =
      Number(
        pdoTax.id,
      );

    if (
      !Number.isInteger(
        pdoTaxId,
      ) ||
      pdoTaxId <= 0
    ) {
      throw new Error(
        "SAMEDAY_PDO_ID_INVALID",
      );
    }

    // ========================================================
    // PICKUP POINT / CONTACT PERSON
    // ========================================================

    const pickupPointId =
      requiredNumberEnv(
        "SAMEDAY_PICKUP_POINT_ID",
      );

    const contactPersonId =
      requiredNumberEnv(
        "SAMEDAY_CONTACT_PERSON_ID",
      );

    // ========================================================
    // CLIENT INTERNAL REFERENCE
    // ========================================================

    const clientInternalReference =
      generateInternalReference(
        order._id.toString(),
      );

    // ========================================================
    // PACKAGE
    // ========================================================

    const parcel: {
      weight: number;
      width?: number;
      length?: number;
      height?: number;
    } = {
      weight:
        input.packageWeight,
    };

    if (
      input.width !== undefined
    ) {
      parcel.width =
        input.width;
    }

    if (
      input.length !== undefined
    ) {
      parcel.length =
        input.length;
    }

    if (
      input.height !== undefined
    ) {
      parcel.height =
        input.height;
    }

    // ========================================================
    // AWB PAYLOAD
    // ========================================================

    const payload:
      SamedayCreateAwbPayload = {
      pickupPoint:
        pickupPointId,

      contactPerson:
        contactPersonId,

      packageType,

      packageNumber: 1,

      packageWeight:
        input.packageWeight,

      /**
       * Locker NextDay
       */
      service: 15,

      /**
       * Contractantul Sameday
       * plătește transportul.
       */
      awbPayment: 1,

      /**
       * Plata produsului se face
       * prin Nexora / NETOPIA.
       *
       * Nu avem ramburs.
       */
      cashOnDelivery: 0,

      /**
       * Folosim valoarea produsului
       * ca valoare asigurată.
       */
      insuredValue:
        Math.max(
          Number(
            listing.price ?? 0,
          ),
          0,
        ),

      /**
       * PDO folosește pickup point-ul
       * contului, nu thirdParty pickup.
       */
      thirdPartyPickup: 0,

      awbRecipient: {
        county:
          destinationLocker
            .countyId,

        city:
          destinationLocker
            .cityId,

        countyString:
          destinationLocker
            .county,

        cityString:
          destinationLocker
            .city,

        address:
          destinationLocker
            .address,

        postalCode:
          destinationLocker
            .postalCode,

        name:
          normalizeName(
            buyer.fullName,
            buyer.username,
          ),

        phoneNumber:
          buyerPhone,

        email:
          buyer.email,

        personType: 0,
      },

      parcels: [
        parcel,
      ],

      clientInternalReference,

      orderNumber:
        order._id.toString(),

      observation:
        `Nexora - ${listing.title}`,

      /**
       * PDO + ID-ul specific
       * acestui cont și packageType.
       */
      serviceTaxes: [
        `PDO ${pdoTaxId}`,
      ],

      /**
       * Easybox-ul REAL ales
       * de cumpărător pe hartă.
       */
      oohLastMile:
        destinationLocker.oohId,
    };

    // ========================================================
    // CREATE LOCAL SHIPMENT FIRST
    // ========================================================

    const shipment =
      await SamedayShipmentModel.create({
        order:
          order._id,

        buyer:
          order.buyer,

        seller:
          order.seller,

        provider:
          "sameday",

        serviceId: 15,

        clientInternalReference,

        pickupPointId,

        contactPersonId,

        oohLastMile:
          destinationLocker.oohId,

        destinationLockerName:
          destinationLocker.name,

        destinationLockerAddress:
          destinationLocker.address,

        destinationLockerCity:
          destinationLocker.city,

        destinationLockerCounty:
          destinationLocker.county,

        destinationLockerLat:
          destinationLocker.lat,

        destinationLockerLng:
          destinationLocker.lng,

        packageType,

        packageNumber: 1,

        packageWeight:
          input.packageWeight,

        width:
          input.width ?? null,

        length:
          input.length ?? null,

        height:
          input.height ?? null,

        pdoEnabled: true,

        pdoTaxId,

        labelFree: false,

        status: "pending",
      });

    // ========================================================
    // CREATE AWB
    // ========================================================

    try {
      const awb =
        await samedayService
          .createAwb(
            payload,
          );

      shipment.awbNumber =
        awb.awbNumber;

      shipment.awbCost =
        awb.awbCost;

      shipment.pdfLink =
        awb.pdfLink ?? null;

      shipment.parcelAwbNumbers =
        (
          awb.parcels ?? []
        )
          .map(
            (parcel) =>
              parcel.awbNumber,
          )
          .filter(Boolean);

      shipment.status =
        "ready_for_dropoff";

      shipment.rawResponse =
        awb as unknown as Record<
          string,
          unknown
        >;

      shipment.errorMessage =
        null;

      await shipment.save();

      // Comanda intră în procesare.
      order.status =
        "processing";

      await order.save();

      return shipment;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      shipment.status =
        "failed";

      shipment.errorMessage =
        message;

      await shipment.save();

      throw error;
    }
  }

  // ==========================================================
  // GET SHIPMENT BY ORDER
  // ==========================================================

  async getShipmentByOrder(
    orderId: string,
  ) {
    if (
      !mongoose.isValidObjectId(
        orderId,
      )
    ) {
      throw new Error(
        "SHIPMENT_NOT_FOUND",
      );
    }

    const shipment =
      await SamedayShipmentModel
        .findOne({
          order: orderId,
        });

    if (!shipment) {
      throw new Error(
        "SHIPMENT_NOT_FOUND",
      );
    }

    return shipment;
  }

  // ==========================================================
  // GET SELLER SHIPMENTS
  // ==========================================================

  async getSellerShipments(
    sellerId: string,
  ) {
    return SamedayShipmentModel
      .find({
        seller: sellerId,
      })
      .sort({
        createdAt: -1,
      });
  }

  // ==========================================================
  // GET BUYER SHIPMENTS
  // ==========================================================

  async getBuyerShipments(
    buyerId: string,
  ) {
    return SamedayShipmentModel
      .find({
        buyer: buyerId,
      })
      .sort({
        createdAt: -1,
      });
  }
}

export const samedayShipmentService =
  new SamedayShipmentService();