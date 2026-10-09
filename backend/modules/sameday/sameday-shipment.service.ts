// backend/modules/sameday/sameday-shipment.service.ts

import crypto from "crypto";
import mongoose from "mongoose";

import User from "../../models/Users.js";

import Order from "../order/order.model.js";

import { ListingModel } from "../listing/listing.model.js";

import SamedayShipmentModel from "./sameday-shipment.model.js";

import { samedayService } from "./sameday.service.js";

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

  packageType?: SamedayPackageType;

  packageWeight: number;

  width?: number;

  length?: number;

  height?: number;
}

// ============================================================
// HELPERS
// ============================================================

function requiredNumberEnv(name: string): number {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`${name}_MISSING`);
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${name}_INVALID`);
  }

  return parsed;
}

function normalizeName(fullName: unknown, username: unknown): string {
  const name = String(fullName ?? "").trim();

  if (name) {
    return name;
  }

  const fallback = String(username ?? "").trim();

  return fallback || "Utilizator Nexora";
}

function normalizePhone(value: unknown): string {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "");
}

function generateInternalReference(orderId: string): string {
  return (
    "NX-SD-" +
    `${orderId}-` +
    crypto.randomBytes(5).toString("hex").toUpperCase()
  );
}

// ============================================================
// SERVICE
// ============================================================

class SamedayShipmentService {
  // ==========================================================
  // CREATE LOCKER NEXTDAY SHIPMENT
  // ==========================================================

  async createLockerShipment(input: CreateLockerShipmentInput) {
    // ========================================================
    // ORDER ID
    // ========================================================

    if (!mongoose.isValidObjectId(input.orderId)) {
      throw new Error("ORDER_NOT_FOUND");
    }

    // ========================================================
    // PACKAGE WEIGHT
    // ========================================================

    if (!Number.isFinite(input.packageWeight) || input.packageWeight <= 0) {
      throw new Error("INVALID_PACKAGE_WEIGHT");
    }

    // ========================================================
    // PACKAGE TYPE
    // ========================================================

    const packageType = input.packageType ?? 0;

    if (packageType !== 0 && packageType !== 1 && packageType !== 2) {
      throw new Error("INVALID_PACKAGE_TYPE");
    }

    // ========================================================
    // DIMENSIONS
    // ========================================================

    if (
      input.width !== undefined &&
      (!Number.isFinite(input.width) || input.width <= 0)
    ) {
      throw new Error("INVALID_PACKAGE_WIDTH");
    }

    if (
      input.length !== undefined &&
      (!Number.isFinite(input.length) || input.length <= 0)
    ) {
      throw new Error("INVALID_PACKAGE_LENGTH");
    }

    if (
      input.height !== undefined &&
      (!Number.isFinite(input.height) || input.height <= 0)
    ) {
      throw new Error("INVALID_PACKAGE_HEIGHT");
    }

    // ========================================================
    // EXISTING SHIPMENT
    //
    // Nu generăm două AWB-uri pentru aceeași comandă.
    // ========================================================

    const existingShipment = await SamedayShipmentModel.findOne({
      order: input.orderId,
    });

    if (existingShipment && existingShipment.status !== "failed") {
      return existingShipment;
    }

    // ========================================================
    // ORDER
    // ========================================================

    const order = await Order.findById(input.orderId);

    if (!order) {
      throw new Error("ORDER_NOT_FOUND");
    }

    // ========================================================
    // ORDER STATUS
    // ========================================================

    if (order.status === "cancelled" || order.status === "refunded") {
      throw new Error("ORDER_NOT_SHIPPABLE");
    }

    if (order.status !== "paid" && order.status !== "processing") {
      throw new Error("ORDER_NOT_PAID");
    }

    // ========================================================
    // DELIVERY METHOD
    // ========================================================

    if (order.deliveryMethod !== "pickup_point") {
      throw new Error("ORDER_NOT_EASYBOX_DELIVERY");
    }

    // ========================================================
    // DESTINATION EASYBOX
    //
    // Easybox-ul NU vine din request.
    //
    // Este cel ales de cumpărător la checkout și salvat
    // permanent în Order după confirmarea plății.
    // ========================================================

    const destinationLockerId = Number(order.destinationLockerId);

    if (!Number.isInteger(destinationLockerId) || destinationLockerId <= 0) {
      throw new Error("ORDER_EASYBOX_MISSING");
    }

    // ========================================================
    // USERS + LISTING
    // ========================================================

    const [buyer, seller, listing] = await Promise.all([
      User.findById(order.buyer),

      User.findById(order.seller),

      ListingModel.findById(order.listing),
    ]);

    if (!buyer) {
      throw new Error("BUYER_NOT_FOUND");
    }

    if (!seller) {
      throw new Error("SELLER_NOT_FOUND");
    }

    if (!listing) {
      throw new Error("LISTING_NOT_FOUND");
    }

    // ========================================================
    // BUYER CONTACT
    // ========================================================

    const buyerPhone = normalizePhone(buyer.phone);

    if (!buyerPhone) {
      throw new Error("BUYER_PHONE_REQUIRED");
    }

    const buyerEmail = String(buyer.email ?? "").trim();

    if (!buyerEmail) {
      throw new Error("BUYER_EMAIL_REQUIRED");
    }

    // ========================================================
    // VERIFY DESTINATION EASYBOX WITH SAMEDAY
    //
    // Chiar dacă ID-ul este salvat în Order, verificăm din nou
    // că locația există și este încă disponibilă.
    // ========================================================

    const lockerResponse = await samedayService.getOohLocations({
      listingType: 0,

      oohList: String(destinationLockerId),

      countryCode: "RO",

      page: 1,

      countPerPage: 100,
    });

    const destinationLocker: SamedayOohLocation | undefined =
      lockerResponse.data.find(
        (location) =>
          Number(location.oohId) === destinationLockerId &&
          location.oohType === 0 &&
          location.clientVisible !== 0,
      );

    if (!destinationLocker) {
      throw new Error("DESTINATION_LOCKER_NOT_FOUND");
    }

    // ========================================================
    // LOCKER NEXTDAY SERVICE
    // ========================================================

    const services = await samedayService.getServices(1, 500);

    const lockerService = services.data.find(
      (service) => Number(service.id) === 15,
    );

    if (!lockerService) {
      throw new Error("SAMEDAY_LOCKER_NEXTDAY_NOT_ENABLED");
    }

    // ========================================================
    // PDO
    //
    // Pentru ca vânzătorul să poată depune coletul personal
    // într-un Easybox, contul trebuie să aibă PDO activ
    // pentru Locker NextDay și packageType-ul respectiv.
    // ========================================================

    const pdoTax = lockerService.serviceOptionalTaxes?.find(
      (tax) =>
        String(tax.taxCode ?? tax.code ?? "")
          .trim()
          .toUpperCase() === "PDO" && Number(tax.packageType) === packageType,
    );

    if (!pdoTax) {
      throw new Error("SAMEDAY_PDO_NOT_ENABLED_FOR_LOCKER_NEXTDAY");
    }

    const pdoTaxId = Number(pdoTax.id);

    if (!Number.isInteger(pdoTaxId) || pdoTaxId <= 0) {
      throw new Error("SAMEDAY_PDO_ID_INVALID");
    }

    // ========================================================
    // PICKUP POINT + CONTACT PERSON
    // ========================================================

    const pickupPointId = requiredNumberEnv("SAMEDAY_PICKUP_POINT_ID");

    const contactPersonId = requiredNumberEnv("SAMEDAY_CONTACT_PERSON_ID");

    // ========================================================
    // INTERNAL REFERENCE
    // ========================================================

    const clientInternalReference = generateInternalReference(
      order._id.toString(),
    );

    // ========================================================
    // PARCEL
    // ========================================================

    const parcel: {
      weight: number;

      width?: number;

      length?: number;

      height?: number;
    } = {
      weight: input.packageWeight,
    };

    if (input.width !== undefined) {
      parcel.width = input.width;
    }

    if (input.length !== undefined) {
      parcel.length = input.length;
    }

    if (input.height !== undefined) {
      parcel.height = input.height;
    }

    // ========================================================
    // SAMEDAY AWB PAYLOAD
    // ========================================================

    const payload: SamedayCreateAwbPayload = {
      // ------------------------------------------------------
      // ACCOUNT
      // ------------------------------------------------------

      pickupPoint: pickupPointId,

      contactPerson: contactPersonId,

      // ------------------------------------------------------
      // PACKAGE
      // ------------------------------------------------------

      packageType,

      packageNumber: 1,

      packageWeight: input.packageWeight,

      parcels: [parcel],

      // ------------------------------------------------------
      // SERVICE
      // Locker NextDay
      // ------------------------------------------------------

      service: 15,

      awbPayment: 1,

      // ------------------------------------------------------
      // ORDER IS ALREADY PAID THROUGH NEXORA
      // ------------------------------------------------------

      cashOnDelivery: 0,

      // ------------------------------------------------------
      // INSURANCE
      // ------------------------------------------------------

      insuredValue: Math.max(Number(listing.price ?? 0), 0),

      // ------------------------------------------------------
      // PDO
      // ------------------------------------------------------

      thirdPartyPickup: 0,

      serviceTaxes: [`PDO ${pdoTaxId}`],

      // ------------------------------------------------------
      // RECIPIENT
      // ------------------------------------------------------

      awbRecipient: {
        county: destinationLocker.countyId,

        city: destinationLocker.cityId,

        countyString: destinationLocker.county,

        cityString: destinationLocker.city,

        address: destinationLocker.address,

        postalCode: destinationLocker.postalCode,

        name: normalizeName(buyer.fullName, buyer.username),

        phoneNumber: buyerPhone,

        email: buyerEmail,

        personType: 0,
      },

      // ------------------------------------------------------
      // INTERNAL REFERENCES
      // ------------------------------------------------------

      clientInternalReference,

      orderNumber: order._id.toString(),

      observation: `Nexora - ${listing.title}`,

      // ------------------------------------------------------
      // DESTINATION EASYBOX
      // ------------------------------------------------------

      oohLastMile: destinationLocker.oohId,
    };

    // ========================================================
    // FAILED SHIPMENT RETRY
    // ========================================================

    if (existingShipment && existingShipment.status === "failed") {
      await SamedayShipmentModel.deleteOne({
        _id: existingShipment._id,
      });
    }

    // ========================================================
    // CREATE LOCAL SHIPMENT
    // ========================================================

    const shipment = await SamedayShipmentModel.create({
      // --------------------------------------------------
      // REFERENCES
      // --------------------------------------------------

      order: order._id,

      buyer: order.buyer,

      seller: order.seller,

      // --------------------------------------------------
      // PROVIDER
      // --------------------------------------------------

      provider: "sameday",

      serviceId: 15,

      clientInternalReference,

      // --------------------------------------------------
      // ACCOUNT
      // --------------------------------------------------

      pickupPointId,

      contactPersonId,

      // --------------------------------------------------
      // EASYBOX
      // --------------------------------------------------

      oohLastMile: destinationLocker.oohId,

      destinationLockerName: destinationLocker.name,

      destinationLockerAddress: destinationLocker.address,

      destinationLockerCity: destinationLocker.city,

      destinationLockerCounty: destinationLocker.county,

      destinationLockerLat: destinationLocker.lat,

      destinationLockerLng: destinationLocker.lng,

      // --------------------------------------------------
      // PACKAGE
      // --------------------------------------------------

      packageType,

      packageNumber: 1,

      packageWeight: input.packageWeight,

      width: input.width ?? null,

      length: input.length ?? null,

      height: input.height ?? null,

      // --------------------------------------------------
      // PDO
      // --------------------------------------------------

      pdoEnabled: true,

      pdoTaxId,

      // --------------------------------------------------
      // LABEL FREE
      // Standard flow momentan = AWB PDF printat.
      // --------------------------------------------------

      labelFree: false,

      // --------------------------------------------------
      // STATUS
      // --------------------------------------------------

      status: "pending",
    });

    // ========================================================
    // CREATE SAMEDAY AWB
    // ========================================================

    try {
      const awb = await samedayService.createAwb(payload);

      // ======================================================
      // AWB DATA
      // ======================================================

      shipment.awbNumber = awb.awbNumber;

      shipment.awbCost = awb.awbCost;

      shipment.pdfLink = awb.pdfLink ?? null;

      shipment.parcelAwbNumbers = (awb.parcels ?? [])
        .map((parcelItem) => parcelItem.awbNumber)
        .filter(Boolean);

      // ======================================================
      // SHIPMENT STATUS
      // ======================================================

      shipment.status = "ready_for_dropoff";

      shipment.rawResponse = awb as unknown as Record<string, unknown>;

      shipment.errorMessage = null;

      await shipment.save();

      // ======================================================
      // ORDER STATUS
      // ======================================================

      order.status = "processing";

      await order.save();

      return shipment;
    } catch (error) {
      // ======================================================
      // FAILURE
      // ======================================================

      const message = error instanceof Error ? error.message : String(error);

      shipment.status = "failed";

      shipment.errorMessage = message;

      await shipment.save();

      throw error;
    }
  }

  // ==========================================================
  // GET SHIPMENT BY ORDER
  // ==========================================================

  async getShipmentByOrder(orderId: string) {
    if (!mongoose.isValidObjectId(orderId)) {
      throw new Error("SHIPMENT_NOT_FOUND");
    }

    const shipment = await SamedayShipmentModel.findOne({
      order: orderId,
    });

    if (!shipment) {
      throw new Error("SHIPMENT_NOT_FOUND");
    }

    return shipment;
  }

  // ==========================================================
  // GET SELLER SHIPMENTS
  // ==========================================================

  async getSellerShipments(sellerId: string) {
    return SamedayShipmentModel.find({
      seller: sellerId,
    }).sort({
      createdAt: -1,
    });
  }

  // ==========================================================
  // GET BUYER SHIPMENTS
  // ==========================================================

  async getBuyerShipments(buyerId: string) {
    return SamedayShipmentModel.find({
      buyer: buyerId,
    }).sort({
      createdAt: -1,
    });
  }
}

// ============================================================
// SINGLETON
// ============================================================

export const samedayShipmentService = new SamedayShipmentService();
