import assert from "node:assert/strict";
import test from "node:test";
import { resolvePurchasePrice, OfferCheckoutError, OfferPriceSnapshot } from "../services/offer-pricing.service.js";

const offerId = "507f1f77bcf86cd799439011";
const input = { buyerId: "buyer", sellerId: "seller", listingId: "listing", listingPrice: 500, currency: "RON", offerId };
const accepted: OfferPriceSnapshot = {
  buyer: "buyer", seller: "seller", listing: "listing", status: "accepted", amount: 400, currency: "RON",
};

test("accepted offer sets the negotiated item price, not the public price", async () => {
  assert.deepEqual(await resolvePurchasePrice(input, async () => accepted), { itemPrice: 400, offerId });
});
test("regular purchases retain the public price and never load an offer", async () => {
  assert.deepEqual(await resolvePurchasePrice({ ...input, offerId: undefined }, async () => { throw new Error("unexpected lookup"); }), { itemPrice: 500, offerId: null });
});
for (const status of ["pending", "rejected", "cancelled", "expired"]) {
  test(`rejects ${status} offers`, async () => {
    await assert.rejects(resolvePurchasePrice(input, async () => ({ ...accepted, status })), OfferCheckoutError);
  });
}
for (const field of ["buyer", "seller", "listing"] as const) {
  test(`rejects offers for another ${field}`, async () => {
    await assert.rejects(resolvePurchasePrice(input, async () => ({ ...accepted, [field]: "someone-else" })), OfferCheckoutError);
  });
}
test("rejects missing offers and invalid identifiers without full-price fallback", async () => {
  await assert.rejects(resolvePurchasePrice(input, async () => null), OfferCheckoutError);
  for (const id of ["", "invalid", { $ne: null }]) {
    await assert.rejects(resolvePurchasePrice({ ...input, offerId: id }, async () => accepted), OfferCheckoutError);
  }
});
test("rejects invalid currency or amount", async () => {
  await assert.rejects(resolvePurchasePrice(input, async () => ({ ...accepted, currency: "EUR" })), OfferCheckoutError);
  for (const amount of [0, -10, NaN, Infinity]) {
    await assert.rejects(resolvePurchasePrice(input, async () => ({ ...accepted, amount })), OfferCheckoutError);
  }
});
