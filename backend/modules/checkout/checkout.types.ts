export interface CheckoutPrice {
  itemPrice: number;
  buyerProtectionFee: number;
  shippingCost: number;
  total: number;
  currency: string;
}

export interface CheckoutDelivery {
  method: "courier" | "pickup_point";
  pickupPointId?: string;
  pickupPointName?: string;
  pickupPointAddress?: string;
}

export interface CheckoutRequest {
  listingId: string;
  addressId: string;
  delivery: CheckoutDelivery;
  paymentMethod: "card" | "google_pay" | "apple_pay";
}