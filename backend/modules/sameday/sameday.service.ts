// backend/modules/sameday/sameday.service.ts

import {
  buildSamedayUrl,
  getSamedayConfig,
  SAMEDAY_ENDPOINTS,
} from "./sameday.config.js";

import type {
  SamedayAuthResponse,
  SamedayPaginatedResponse,
  SamedayPickupPoint,
  SamedayService as SamedayServiceItem,
  SamedayCounty,
  SamedayCity,
  SamedayOohLocation,
  SamedayCreateAwbPayload,
  SamedayCreateAwbResponse,
  SamedayAwbSearchResult,
  SamedayShipmentStatus,
  SamedayApiError,
} from "./sameday.types.js";

// ============================================================
// INTERNAL TYPES
// ============================================================

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  query?: Record<
    string,
    string | number | boolean | undefined | null
  >;

  body?: unknown;

  retryAuth?: boolean;
}

interface CachedToken {
  token: string;

  expiresAt: number;
}

// ============================================================
// HELPERS
// ============================================================

function parseUtcDate(value: string): number {
  if (!value) {
    return 0;
  }

  /**
   * Sameday returnează:
   *
   * 2024-09-24 09:54
   *
   * expire_at_utc este UTC.
   */
  const normalized = value
    .trim()
    .replace(" ", "T");

  const withTimezone =
    normalized.endsWith("Z")
      ? normalized
      : `${normalized}Z`;

  const timestamp =
    new Date(withTimezone).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
}

function getErrorMessage(
  data: unknown,
  fallback: string,
): string {
  if (
    data &&
    typeof data === "object"
  ) {
    const error =
      data as SamedayApiError;

    if (
      typeof error.message === "string" &&
      error.message.trim()
    ) {
      return error.message;
    }

    if (
      typeof error.error === "string" &&
      error.error.trim()
    ) {
      return error.error;
    }
  }

  return fallback;
}

// ============================================================
// SERVICE
// ============================================================

class SamedayService {
  private cachedToken:
    | CachedToken
    | null = null;

  private authenticationPromise:
    | Promise<string>
    | null = null;

  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  private isTokenValid(): boolean {
    if (!this.cachedToken) {
      return false;
    }

    /**
     * Regenerăm tokenul cu 5 minute
     * înainte de expirarea reală.
     */
    const safetyWindow =
      5 * 60 * 1000;

    return (
      Date.now() <
      this.cachedToken.expiresAt -
        safetyWindow
    );
  }

  private async authenticate(): Promise<string> {
    if (this.isTokenValid()) {
      return this.cachedToken!.token;
    }

    /**
     * Dacă mai multe requesturi ajung simultan
     * fără token, facem o singură autentificare.
     */
    if (this.authenticationPromise) {
      return this.authenticationPromise;
    }

    this.authenticationPromise =
      this.performAuthentication();

    try {
      return await this.authenticationPromise;
    } finally {
      this.authenticationPromise =
        null;
    }
  }

  private async performAuthentication(): Promise<string> {
    const config =
      getSamedayConfig();

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => controller.abort(),
        config.requestTimeoutMs,
      );

    try {
      const formData =
        new FormData();

      if (config.rememberMe) {
        formData.append(
          "remember_me",
          "1",
        );
      }

      const response =
        await fetch(
          buildSamedayUrl(
            SAMEDAY_ENDPOINTS.authenticate,
          ),
          {
            method: "POST",

            headers: {
              "X-AUTH-USERNAME":
                config.username,

              "X-AUTH-PASSWORD":
                config.password,

              Accept:
                "application/json",
            },

            body: config.rememberMe
              ? formData
              : undefined,

            signal:
              controller.signal,
          },
        );

      const data =
        await this.readResponse(
          response,
        );

      if (!response.ok) {
        throw new Error(
          getErrorMessage(
            data,
            `SAMEDAY_AUTH_FAILED_${response.status}`,
          ),
        );
      }

      const auth =
        data as SamedayAuthResponse;

      if (
        !auth.token ||
        typeof auth.token !== "string"
      ) {
        throw new Error(
          "SAMEDAY_AUTH_TOKEN_MISSING",
        );
      }

      let expiresAt =
        parseUtcDate(
          auth.expire_at_utc,
        );

      /**
       * Fallback în cazul în care Sameday
       * schimbă formatul datei.
       */
      if (!expiresAt) {
        expiresAt =
          Date.now() +
          (
            config.rememberMe
              ? 13 * 24 * 60 * 60 * 1000
              : 11 * 60 * 60 * 1000
          );
      }

      this.cachedToken = {
        token:
          auth.token.trim(),

        expiresAt,
      };

      return this.cachedToken.token;
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new Error(
          "SAMEDAY_AUTH_TIMEOUT",
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  // ==========================================================
  // GENERIC REQUEST
  // ==========================================================

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const config =
      getSamedayConfig();

    const token =
      await this.authenticate();

    const url =
      new URL(
        buildSamedayUrl(endpoint),
      );

    for (
      const [key, value]
      of Object.entries(
        options.query ?? {},
      )
    ) {
      if (
        value === undefined ||
        value === null
      ) {
        continue;
      }

      url.searchParams.set(
        key,
        String(value),
      );
    }

    const controller =
      new AbortController();

    const timeout =
      setTimeout(
        () => controller.abort(),
        config.requestTimeoutMs,
      );

    try {
      const headers:
        Record<string, string> = {
        "X-AUTH-TOKEN": token,

        Accept:
          "application/json",
      };

      let body:
        string | undefined;

      if (
        options.body !== undefined
      ) {
        headers[
          "Content-Type"
        ] = "application/json";

        body =
          JSON.stringify(
            options.body,
          );
      }

      const response =
        await fetch(
          url,
          {
            method:
              options.method ??
              "GET",

            headers,

            body,

            signal:
              controller.signal,
          },
        );

      /**
       * Dacă tokenul a expirat/revocat,
       * îl ștergem și încercăm o singură dată.
       */
      if (
        (
          response.status === 401 ||
          response.status === 403
        ) &&
        options.retryAuth !== false
      ) {
        this.cachedToken =
          null;

        return this.request<T>(
          endpoint,
          {
            ...options,

            retryAuth: false,
          },
        );
      }

      const data =
        await this.readResponse(
          response,
        );

      if (!response.ok) {
        const message =
          getErrorMessage(
            data,
            `SAMEDAY_API_ERROR_${response.status}`,
          );

        throw new Error(
          message,
        );
      }

      return data as T;
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        throw new Error(
          "SAMEDAY_REQUEST_TIMEOUT",
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  // ==========================================================
  // RESPONSE PARSER
  // ==========================================================

  private async readResponse(
    response: Response,
  ): Promise<unknown> {
    const text =
      await response.text();

    if (!text.trim()) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        message: text,
      };
    }
  }

  // ==========================================================
  // PICKUP POINTS
  // ==========================================================

  async getPickupPoints(
    page = 1,
    countPerPage = 500,
  ) {
    return this.request<
      SamedayPaginatedResponse<SamedayPickupPoint>
    >(
      SAMEDAY_ENDPOINTS.pickupPoints,
      {
        query: {
          page,
          countPerPage,
        },
      },
    );
  }

  // ==========================================================
  // SERVICES
  // ==========================================================

  async getServices(
    page = 1,
    countPerPage = 500,
  ) {
    return this.request<
      SamedayPaginatedResponse<SamedayServiceItem>
    >(
      SAMEDAY_ENDPOINTS.services,
      {
        query: {
          page,
          countPerPage,
        },
      },
    );
  }

  // ==========================================================
  // COUNTIES
  // ==========================================================

  async getCounties(options?: {
    name?: string;

    countryCode?: string;

    page?: number;

    countPerPage?: number;
  }) {
    const config =
      getSamedayConfig();

    return this.request<
      SamedayPaginatedResponse<SamedayCounty>
    >(
      SAMEDAY_ENDPOINTS.counties,
      {
        query: {
          name:
            options?.name,

          countryCode:
            options?.countryCode ??
            config.countryCode,

          page:
            options?.page ?? 1,

          countPerPage:
            options?.countPerPage ??
            500,
        },
      },
    );
  }

  // ==========================================================
  // CITIES
  // ==========================================================

  async getCities(options?: {
    name?: string;

    county?: string;

    postalCode?: string;

    countryCode?: string;

    page?: number;

    countPerPage?: number;
  }) {
    const config =
      getSamedayConfig();

    return this.request<
      SamedayPaginatedResponse<SamedayCity>
    >(
      SAMEDAY_ENDPOINTS.cities,
      {
        query: {
          name:
            options?.name,

          county:
            options?.county,

          postalCode:
            options?.postalCode,

          countryCode:
            options?.countryCode ??
            config.countryCode,

          page:
            options?.page ?? 1,

          countPerPage:
            options?.countPerPage ??
            500,
        },
      },
    );
  }

  // ==========================================================
  // OOH LOCATIONS
  // EASYBOX + PUDO
  // ==========================================================

  async getOohLocations(options?: {
    /**
     * 0 = doar Easybox
     * 1 = Easybox + PUDO
     */
    listingType?: 0 | 1;

    oohList?: string;

    countryCode?: string;

    page?: number;

    countPerPage?: number;
  }) {
    const config =
      getSamedayConfig();

    return this.request<
      SamedayPaginatedResponse<SamedayOohLocation>
    >(
      SAMEDAY_ENDPOINTS.oohLocations,
      {
        query: {
          listingType:
            options?.listingType ??
            1,

          oohList:
            options?.oohList,

          countryCode:
            options?.countryCode ??
            config.countryCode,

          page:
            options?.page ?? 1,

          countPerPage:
            options?.countPerPage ??
            500,
        },
      },
    );
  }

  // ==========================================================
  // CREATE AWB
  // ==========================================================

  async createAwb(
    payload: SamedayCreateAwbPayload,
  ) {
    return this.request<
      SamedayCreateAwbResponse
    >(
      SAMEDAY_ENDPOINTS.createAwb,
      {
        method: "POST",

        body: payload,
      },
    );
  }

  // ==========================================================
  // FIND AWB BY INTERNAL REFERENCE
  // ==========================================================

  async getAwbByInternalReference(
    clientInternalReference: string,
  ) {
    const reference =
      clientInternalReference.trim();

    if (!reference) {
      throw new Error(
        "SAMEDAY_INTERNAL_REFERENCE_REQUIRED",
      );
    }

    return this.request<
      SamedayAwbSearchResult
    >(
      `/api/client/awb/${encodeURIComponent(reference)}`,
    );
  }

  // ==========================================================
  // LOCAL STATUS SYNC
  // ==========================================================

  async getStatusSync(options: {
    startTimestamp: string;

    endTimestamp: string;

    page?: number;

    countPerPage?: number;
  }) {
    return this.request<
      SamedayPaginatedResponse<SamedayShipmentStatus>
    >(
      SAMEDAY_ENDPOINTS.statusSync,
      {
        query: {
          startTimestamp:
            options.startTimestamp,

          endTimestamp:
            options.endTimestamp,

          page:
            options.page ?? 1,

          countPerPage:
            options.countPerPage ??
            500,
        },
      },
    );
  }

  // ==========================================================
  // CROSSBORDER STATUS SYNC
  // ==========================================================

  async getCrossborderStatusSync(
    options: {
      startTimestamp: string;

      endTimestamp: string;

      page?: number;

      countPerPage?: number;
    },
  ) {
    return this.request<
      SamedayPaginatedResponse<SamedayShipmentStatus>
    >(
      SAMEDAY_ENDPOINTS.crossborderStatusSync,
      {
        query: {
          startTimestamp:
            options.startTimestamp,

          endTimestamp:
            options.endTimestamp,

          page:
            options.page ?? 1,

          countPerPage:
            options.countPerPage ??
            500,
        },
      },
    );
  }

  // ==========================================================
  // TOKEN MANAGEMENT
  // ==========================================================

  clearToken() {
    this.cachedToken =
      null;
  }

  async testConnection() {
    await this.authenticate();

    return {
      success: true,

      authenticated: true,
    };
  }
}

// ============================================================
// SINGLETON
// ============================================================

export const samedayService =
  new SamedayService();