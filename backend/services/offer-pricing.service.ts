import mongoose from "mongoose";
import Offer from "../models/Offer.js";

export class OfferCheckoutError extends Error {}

interface PurchaseInput {
  buyerId: string;
  listingId: string;
  sellerId: string;
  listingPrice: number;
  currency: string;
  offerId?: unknown;
}

export interface OfferPriceSnapshot {
  buyer: { toString(): string };
  seller: { toString(): string };
  listing: { toString(): string };
  status: string;
  amount: number;
  currency: string;
}

// Both the preview and the actual payment use this server-owned price.
export async function resolvePurchasePrice(
  input: PurchaseInput,
  findOffer: (id: string) => Promise<OfferPriceSnapshot | null> =
    async (id) => Offer.findById(id).lean(),
) {
  if (input.offerId == null) {
    return { itemPrice: Number(Number(input.listingPrice).toFixed(2)), offerId: null };
  }
  if (typeof input.offerId !== "string" || !mongoose.isValidObjectId(input.offerId)) {
    throw new OfferCheckoutError("Oferta selectată este invalidă.");
  }
  const offer = await findOffer(input.offerId);
  if (!offer || offer.status !== "accepted" ||
      offer.buyer.toString() !== input.buyerId ||
      offer.seller.toString() !== input.sellerId ||
      offer.listing.toString() !== input.listingId) {
    throw new OfferCheckoutError("Oferta nu este acceptată sau nu este disponibilă pentru acest cont și produs.");
  }
  if (String(offer.currency).toUpperCase() !== input.currency.toUpperCase()) {
    throw new OfferCheckoutError("Moneda ofertei nu mai corespunde produsului.");
  }
  const itemPrice = Number(Number(offer.amount).toFixed(2));
  if (!Number.isFinite(itemPrice) || itemPrice <= 0) {
    throw new OfferCheckoutError("Prețul ofertei este invalid.");
  }
  return { itemPrice, offerId: input.offerId };
}
