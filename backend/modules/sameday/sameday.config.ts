// backend/modules/sameday/sameday.config.ts

export interface SamedayConfig {
  baseUrl: string;

  username: string;

  password: string;

  rememberMe: boolean;

  countryCode: string;

  requestTimeoutMs: number;
}

// ============================================================
// HELPERS
// ============================================================

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(
      `Lipsește variabila de mediu ${name}.`,
    );
  }

  return value.trim();
}

function optionalEnv(
  name: string,
  fallback: string,
): string {
  const value = process.env[name];

  if (!value || !value.trim()) {
    return fallback;
  }

  return value.trim();
}

function booleanEnv(
  name: string,
  fallback: boolean,
): boolean {
  const value = process.env[name];

  if (value === undefined) {
    return fallback;
  }

  return (
    value.toLowerCase() === "true" ||
    value === "1" ||
    value.toLowerCase() === "yes"
  );
}

function numberEnv(
  name: string,
  fallback: number,
): number {
  const value = process.env[name];

  if (!value) {
    return fallback;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}

// ============================================================
// BASE URL
// ============================================================

function getBaseUrl(): string {
  const customBaseUrl =
    process.env.SAMEDAY_BASE_URL?.trim();

  if (customBaseUrl) {
    return customBaseUrl.replace(/\/+$/, "");
  }

  const sandbox = booleanEnv(
    "SAMEDAY_SANDBOX",
    true,
  );

  if (sandbox) {
    return "https://sameday-api.demo.zitec.com";
  }

  return "https://api.sameday.ro";
}

// ============================================================
// CONFIG
// ============================================================

export function getSamedayConfig(): SamedayConfig {
  return {
    baseUrl: getBaseUrl(),

    username: requiredEnv(
      "SAMEDAY_USERNAME",
    ),

    password: requiredEnv(
      "SAMEDAY_PASSWORD",
    ),

    /**
     * remember_me = 1
     * prelungește durata tokenului.
     */
    rememberMe: booleanEnv(
      "SAMEDAY_REMEMBER_ME",
      true,
    ),

    /**
     * Pentru Nexora pornim cu România.
     */
    countryCode: optionalEnv(
      "SAMEDAY_COUNTRY_CODE",
      "RO",
    ).toUpperCase(),

    /**
     * Timeout request HTTP.
     */
    requestTimeoutMs: numberEnv(
      "SAMEDAY_REQUEST_TIMEOUT_MS",
      15000,
    ),
  };
}

// ============================================================
// ENDPOINTS
// ============================================================

export const SAMEDAY_ENDPOINTS = {
  // Authentication
  authenticate: "/api/authenticate",

  // Client
  pickupPoints: "/api/client/pickup-points",

  services: "/api/client/services",

  // OOH = Easybox + PUDO
  oohLocations: "/api/client/ooh-locations",

  // Geolocation
  counties: "/api/geolocation/county",

  cities: "/api/geolocation/city",

  // AWB
  createAwb: "/api/awb",

  // Status
  statusSync: "/api/client/status-sync",

  crossborderStatusSync:
    "/api/client/xb-status-sync",
} as const;

// ============================================================
// URL BUILDER
// ============================================================

export function buildSamedayUrl(
  endpoint: string,
): string {
  const { baseUrl } =
    getSamedayConfig();

  const normalizedEndpoint =
    endpoint.startsWith("/")
      ? endpoint
      : `/${endpoint}`;

  return `${baseUrl}${normalizedEndpoint}`;
}