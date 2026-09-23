import mongoose from "mongoose";
import { ListingModel } from "../listing/listing.model.js";
import { AddressModel } from "../profile/address.model.js";

const BUYER_PROTECTION_RATE = 0.05;
const BUYER_PROTECTION_MIN = 2.99;

const SHIPPING_COSTS = {
  courier: 14.99,
  pickup_point: 11.99,
};

function validateObjectId(id: string, message: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(message);
  }
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export async function calculateCheckout(
  userId: string,
  listingId: string,
  addressId: string,
  deliveryMethod: "courier" | "pickup_point",
) {
  validateObjectId(userId, "ID utilizator invalid.");
  validateObjectId(listingId, "ID anunț invalid.");
  validateObjectId(addressId, "ID adresă invalid.");

  const listing = await ListingModel.findOne({
    _id: listingId,
    status: "active",
  }).populate("seller", "username avatar");

  if (!listing) {
    throw new Error(
      "Anunțul nu există sau nu mai este disponibil.",
    );
  }

  if (listing.seller._id.toString() === userId) {
    throw new Error(
      "Nu poți cumpăra propriul anunț.",
    );
  }

  const address = await AddressModel.findOne({
    _id: addressId,
    user: userId,
  });

  if (!address) {
    throw new Error(
      "Adresa nu există sau nu îți aparține.",
    );
  }

  const itemPrice = roundMoney(listing.price);

  const buyerProtectionFee = roundMoney(
    Math.max(
      itemPrice * BUYER_PROTECTION_RATE,
      BUYER_PROTECTION_MIN,
    ),
  );

  const shippingCost = roundMoney(
    SHIPPING_COSTS[deliveryMethod],
  );

  const total = roundMoney(
    itemPrice +
      buyerProtectionFee +
      shippingCost,
  );

  return {
    listing: {
      id: listing._id,
      title: listing.title,
      images: listing.images,
      price: listing.price,
      currency: listing.currency,
    },

    address: {
      id: address._id,
      county: address.county,
      city: address.city,
      street: address.street,
      number: address.number,
      building: address.building,
      staircase: address.staircase,
      floor: address.floor,
      apartment: address.apartment,
      postalCode: address.postalCode,
    },

    delivery: {
      method: deliveryMethod,
      shippingCost,
    },

    price: {
      itemPrice,
      buyerProtectionFee,
      shippingCost,
      total,
      currency: listing.currency,
    },
  };
}