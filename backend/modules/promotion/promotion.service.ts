import mongoose from "mongoose";
import { PromotionModel } from "./promotion.model.js";
import { ListingModel } from "../listing/listing.model.js";

interface PromotionPackage {
  duration: 24 | 72 | 168;
  amount: number;
  currency: string;
}

const PROMOTION_PACKAGES: PromotionPackage[] = [
  {
    duration: 24,
    amount: 19.99,
    currency: "RON",
  },
  {
    duration: 72,
    amount: 39.99,
    currency: "RON",
  },
  {
    duration: 168,
    amount: 69.99,
    currency: "RON",
  },
];

function validateObjectId(id: string, message: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
}

export async function getPromotionPackages() {
  return PROMOTION_PACKAGES;
}

export async function createPromotion(
  userId: string,
  listingId: string,
  duration: number,
) {
  validateObjectId(userId, "ID-ul utilizatorului este invalid.");

  validateObjectId(listingId, "ID-ul anunțului este invalid.");

  if (![24, 72, 168].includes(duration)) {
    throw new Error("Durata promovării este invalidă.");
  }

  const listing = await ListingModel.findOne({
    _id: listingId,
    seller: userId,
  });

  if (!listing) {
    throw new Error("Anunțul nu există sau nu îți aparține.");
  }

  if (listing.status !== "active") {
    throw new Error("Poți promova doar un anunț activ.");
  }

  const promotionDuration = duration as 24 | 72 | 168;

  const promotionPackage = PROMOTION_PACKAGES.find(
    (item) => item.duration === promotionDuration,
  );

  if (!promotionPackage) {
    throw new Error("Pachetul de promovare nu există.");
  }

  const activePromotion = await PromotionModel.findOne({
    user: userId,
    listing: listingId,
    status: "active",
    expiresAt: {
      $gt: new Date(),
    },
  });

  if (activePromotion) {
    throw new Error("Acest anunț are deja o promovare activă.");
  }

  const now = new Date();

  const expiresAt = new Date(now.getTime() + duration * 60 * 60 * 1000);

  const promotion = await PromotionModel.create({
    user: userId,
    listing: listingId,
    type: "boost",
    duration: promotionDuration,
    amount: promotionPackage.amount,
    currency: promotionPackage.currency,
    status: "pending",
    startsAt: now,
    expiresAt,
  });

  return PromotionModel.findById(promotion._id)
    .populate("listing", "title images price currency status")
    .populate("user", "username avatar");
}

export async function getMyPromotions(userId: string) {
  validateObjectId(userId, "ID-ul utilizatorului este invalid.");

  await expirePromotions();

  return PromotionModel.find({
    user: userId,
  })
    .populate("listing", "title images price currency status")
    .sort({
      createdAt: -1,
    });
}

export async function getListingPromotions(userId: string, listingId: string) {
  validateObjectId(userId, "ID-ul utilizatorului este invalid.");

  validateObjectId(listingId, "ID-ul anunțului este invalid.");

  await expirePromotions();

  return PromotionModel.find({
    user: userId,
    listing: listingId,
  })
    .populate("listing", "title images price currency status")
    .sort({
      createdAt: -1,
    });
}

export async function getActivePromotion(listingId: string) {
  validateObjectId(listingId, "ID-ul anunțului este invalid.");

  await expirePromotions();

  return PromotionModel.findOne({
    listing: listingId,
    status: "active",
    startsAt: {
      $lte: new Date(),
    },
    expiresAt: {
      $gt: new Date(),
    },
  }).populate("listing", "title images price currency status");
}

export async function expirePromotions() {
  await PromotionModel.updateMany(
    {
      status: "active",
      expiresAt: {
        $lte: new Date(),
      },
    },
    {
      $set: {
        status: "expired",
      },
    },
  );
}
