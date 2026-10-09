// backend/modules/sameday/sameday.types.ts

// ============================================================
// AUTH
// ============================================================

export interface SamedayAuthResponse {
  token: string;

  expire_at: string;

  expire_at_utc: string;
}

// ============================================================
// PAGINATION
// ============================================================

export interface SamedayPaginatedResponse<T> {
  total: number;

  currentPage: number;

  pages: number;

  perPage: number;

  data: T[];
}

// ============================================================
// PICKUP POINTS
// ============================================================

export interface SamedayContactPerson {
  id: number;

  name?: string;

  phone?: string;

  email?: string;

  default?: boolean;

  [key: string]: unknown;
}

export interface SamedayPickupPoint {
  id: number;

  alias?: string;

  country?: {
    id?: number;
    name?: string;
    code?: string;
  };

  county?: {
    id?: number;
    name?: string;
    code?: string;
  };

  city?: {
    id?: number;
    name?: string;

    samedayDeliveryAgency?: string;
    samedayPickupAgency?: string;

    extraKM?: number;
  };

  address?: string;

  postalCode?: string;

  cutOff?: string;

  defaultPickupPoint?: boolean;

  pickupPointContactPerson?: Array<{
    id: number;

    name?: string;

    phoneNumber?: string;

    defaultContactPerson?: boolean;
  }>;

  status?: boolean;

  [key: string]: unknown;
}

// ============================================================
// SERVICES
// ============================================================

export interface SamedayServiceOptionalTax {
  id: number | string;

  name?: string;

  code?: string;

  packageType?: number;

  [key: string]: unknown;
}

export interface SamedayService {
  id: number;

  name: string;

  code?: string;

  serviceOptionalTaxes?: SamedayServiceOptionalTax[];

  [key: string]: unknown;
}

// ============================================================
// GEOLOCATION
// ============================================================

export interface SamedayCounty {
  id: number;

  name: string;

  countryCode?: string;

  [key: string]: unknown;
}

export interface SamedayCity {
  id: number;

  name: string;

  county?: string;

  countyId?: number;

  postalCode?: string;

  countryCode?: string;

  [key: string]: unknown;
}

// ============================================================
// OOH LOCATIONS
// EASYBOX + PUDO
// ============================================================

export type SamedayOohType =
  | 0 // Easybox
  | 1; // PUDO

export interface SamedayOohSchedule {
  day: number;

  openingHour: string;

  closingHour: string;
}

export interface SamedayOohSpecialSchedule {
  [key: string]: unknown;
}

export interface SamedayOohPhoto {
  "1x"?: string;

  "2x"?: string;

  small?: string;
}

export interface SamedayOohLocation {
  name: string;

  country: string;

  countryId: number;

  county: string;

  countyId: number;

  city: string;

  cityId: number;

  address: string;

  postalCode?: string;

  lat: number;

  lng: number;

  /**
   * < 500000 = Easybox
   * >= 500000 = PUDO
   */
  oohId: number;

  /**
   * 0 = Easybox
   * 1 = PUDO
   */
  oohType: SamedayOohType;

  /**
   * 0 = nu acceptă plată cu card
   * 1 = acceptă plată cu card
   */
  supportedPayment?: number;

  clientVisible?: number;

  deliveryLogisticLocationId?: number;

  deliveryLogisticLocation?: string;

  occupancyLevel?: number;

  email?: string | null;

  phone?: string | null;

  oohRoute?: string;

  schedule?: SamedayOohSchedule[];

  specialSchedule?: SamedayOohSpecialSchedule[];

  photos?: SamedayOohPhoto[];
}

// ============================================================
// AWB
// ============================================================

export type SamedayPackageType =
  | 0 // standard parcel
  | 1 // small parcel
  | 2; // oversized parcel

export type SamedayPersonType =
  | 0 // persoană fizică
  | 1; // companie

// ============================================================
// RECIPIENT
// ============================================================

export interface SamedayAwbRecipient {
  county: string | number;

  city: string | number;

  name: string;

  personType: SamedayPersonType;

  address?: string;

  phoneNumber: string;

  postalCode?: string;

  email?: string;

  companyIban?: string;

  companyName?: string;

  companyOnrcNumber?: string;

  companyBank?: string;

  companyCui?: string;

  countyString?: string;

  cityString?: string;

  service?: number;
}

// ============================================================
// THIRD PARTY
// ============================================================

export interface SamedayThirdParty {
  county?: string | number;

  city?: string | number;

  name: string;

  personType: SamedayPersonType;

  address?: string;

  phoneNumber: string;

  postalCode?: string;

  contactEmail?: string;

  companyIban?: string;

  companyName?: string;

  wantsInvoice?: number;

  service?: number;

  companyOnrcNumber?: string;

  companyBank?: string;

  companyCui?: string;

  countyString?: string;

  cityString?: string;
}

// ============================================================
// PARCEL
// ============================================================

export interface SamedayParcel {
  weight: number;

  width?: number;

  length?: number;

  height?: number;
}

// ============================================================
// RETURN LOCKER
// ============================================================

export interface SamedayReturnLockerParcel {
  eligibilityDate: string;
}

export interface SamedayClientOohParcel {
  eligibilityDate: string;
}

// ============================================================
// CREATE AWB
// ============================================================

export interface SamedayCreateAwbPayload {
  /**
   * ID pickup point Sameday.
   */
  pickupPoint: string | number;

  /**
   * Contact person ID asociat pickup point-ului.
   */
  contactPerson?: string | number;

  /**
   * Tip colet:
   * 0 standard
   * 1 small
   * 2 oversized
   */
  packageType: SamedayPackageType;

  /**
   * Număr colete.
   */
  packageNumber: number;

  /**
   * Greutatea totală.
   */
  packageWeight: number;

  /**
   * Service ID Sameday.
   *
   * Exemple:
   * 7  = 24H
   * 15 = Locker Nextday
   * 24 = Locker Return
   * 51 = Locker2Locker
   * 57 = PUDO Nextday
   */
  service: string | number;

  /**
   * Cine plătește transportul.
   * În documentație valoarea acceptată este 1 = client Sameday.
   */
  awbPayment: 1;

  /**
   * Ramburs.
   * 0 pentru comenzile plătite online.
   */
  cashOnDelivery: number;

  /**
   * Valoare asigurată.
   */
  insuredValue: number;

  /**
   * 1 dacă ridicarea se face de la third party.
   */
  thirdPartyPickup: 0 | 1;

  thirdParty?: SamedayThirdParty;

  awbRecipient: SamedayAwbRecipient;

  parcels: SamedayParcel[];

  /**
   * Referință unică Nexora.
   *
   * Recomandat:
   * orderId / shipmentId.
   */
  clientInternalReference?: string;

  observation?: string;

  priceObservation?: string;

  clientObservation?: string;

  /**
   * Locker/PUDO de predare.
   */
  oohFirstMile?: number;

  /**
   * Locker/PUDO de livrare.
   */
  oohLastMile?: number;

  orderNumber?: string;

  returnLocationId?: string | number;

  serviceTaxes?: Array<string | number>;

  cashOnDeliveryReturns?: number;

  returnLockerParcel?: SamedayReturnLockerParcel;

  clientOohParcel?: SamedayClientOohParcel;
}

// ============================================================
// CREATE AWB RESPONSE
// ============================================================

export interface SamedayAwbParcelResponse {
  position: number;

  awbNumber: string;
}

export interface SamedayReturnAwbResponse {
  awbNumber: string;

  awbCost?: number;

  serviceTaxId?: number;
}

export interface SamedayCreateAwbResponse {
  awbNumber: string;

  awbCost: number;

  parcels: SamedayAwbParcelResponse[];

  pdfLink?: string;

  pickupLogisticLocation?: string;

  deliveryLogisticLocation?: string;

  deliveryLogisticCircle?: string;

  returnAwbs?: SamedayReturnAwbResponse[];

  sortingHub?: string;

  sortingHubId?: number;

  deliveryLogisticLocationId?: number;

  pickupLogisticLocationId?: number;
}

// ============================================================
// AWB SEARCH
// ============================================================

export interface SamedayAwbSearchResult {
  awbNumber?: string;

  [key: string]: unknown;
}

// ============================================================
// SHIPMENT STATUS
// ============================================================

export interface SamedayShipmentStatus {
  awbNumber?: string;

  parcelNumber?: string;

  status?: string;

  statusId?: number;

  statusDate?: string;

  lockerDetails?: Record<string, unknown>;

  oohDetails?: Record<string, unknown>;

  [key: string]: unknown;
}

// ============================================================
// COMMON API ERROR
// ============================================================

export interface SamedayApiError {
  message?: string;

  error?: string;

  errors?: Record<string, unknown>;

  code?: number | string;

  [key: string]: unknown;
}