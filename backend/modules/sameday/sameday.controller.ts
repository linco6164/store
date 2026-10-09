// backend/modules/sameday/sameday.controller.ts

import { Response } from "express";

import type {
  AuthRequest,
} from "../../middleware/auth.js";

import {
  samedayService,
} from "./sameday.service.js";

// ============================================================
// HELPERS
// ============================================================

function parsePositiveInteger(
  value: unknown,
  fallback: number,
): number {
  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return fallback;
  }

  return parsed;
}

function parseOptionalString(
  value: unknown,
): string | undefined {
  if (
    typeof value !== "string"
  ) {
    return undefined;
  }

  const trimmed =
    value.trim();

  return trimmed ||
    undefined;
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return "SAMEDAY_UNKNOWN_ERROR";
}

// ============================================================
// CONTROLLER
// ============================================================

export const samedayController = {
  // ==========================================================
  // TEST CONNECTION
  // ==========================================================

  async testConnection(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result =
        await samedayService
          .testConnection();

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "SAMEDAY CONNECTION ERROR:",
        error,
      );

      return res.status(502).json({
        success: false,
        message:
          "Nu s-a putut realiza conexiunea cu Sameday.",
        error:
          getErrorMessage(error),
      });
    }
  },

  // ==========================================================
  // PICKUP POINTS
  // ==========================================================

  async getPickupPoints(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const page =
        parsePositiveInteger(
          req.query.page,
          1,
        );

      const countPerPage =
        Math.min(
          parsePositiveInteger(
            req.query.countPerPage,
            500,
          ),
          500,
        );

      const result =
        await samedayService
          .getPickupPoints(
            page,
            countPerPage,
          );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "SAMEDAY PICKUP POINTS ERROR:",
        error,
      );

      return res.status(502).json({
        success: false,
        message:
          "Nu am putut încărca punctele de ridicare Sameday.",
        error:
          getErrorMessage(error),
      });
    }
  },

  // ==========================================================
  // SERVICES
  // ==========================================================

  async getServices(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const page =
        parsePositiveInteger(
          req.query.page,
          1,
        );

      const countPerPage =
        Math.min(
          parsePositiveInteger(
            req.query.countPerPage,
            500,
          ),
          500,
        );

      const result =
        await samedayService
          .getServices(
            page,
            countPerPage,
          );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "SAMEDAY SERVICES ERROR:",
        error,
      );

      return res.status(502).json({
        success: false,
        message:
          "Nu am putut încărca serviciile Sameday.",
        error:
          getErrorMessage(error),
      });
    }
  },

  // ==========================================================
  // COUNTIES
  // ==========================================================

  async getCounties(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result =
        await samedayService
          .getCounties({
            name:
              parseOptionalString(
                req.query.name,
              ),

            countryCode:
              parseOptionalString(
                req.query.countryCode,
              ),

            page:
              parsePositiveInteger(
                req.query.page,
                1,
              ),

            countPerPage:
              Math.min(
                parsePositiveInteger(
                  req.query.countPerPage,
                  500,
                ),
                500,
              ),
          });

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "SAMEDAY COUNTIES ERROR:",
        error,
      );

      return res.status(502).json({
        success: false,
        message:
          "Nu am putut încărca județele Sameday.",
        error:
          getErrorMessage(error),
      });
    }
  },

  // ==========================================================
  // CITIES
  // ==========================================================

  async getCities(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result =
        await samedayService
          .getCities({
            name:
              parseOptionalString(
                req.query.name,
              ),

            county:
              parseOptionalString(
                req.query.county,
              ),

            postalCode:
              parseOptionalString(
                req.query.postalCode,
              ),

            countryCode:
              parseOptionalString(
                req.query.countryCode,
              ),

            page:
              parsePositiveInteger(
                req.query.page,
                1,
              ),

            countPerPage:
              Math.min(
                parsePositiveInteger(
                  req.query.countPerPage,
                  500,
                ),
                500,
              ),
          });

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "SAMEDAY CITIES ERROR:",
        error,
      );

      return res.status(502).json({
        success: false,
        message:
          "Nu am putut încărca localitățile Sameday.",
        error:
          getErrorMessage(error),
      });
    }
  },

  // ==========================================================
  // OOH LOCATIONS
  // EASYBOX + PUDO
  // ==========================================================

  async getOohLocations(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      let listingType:
        0 | 1 = 1;

      if (
        String(
          req.query.listingType ??
            "",
        ) === "0"
      ) {
        listingType = 0;
      }

      const result =
        await samedayService
          .getOohLocations({
            listingType,

            oohList:
              parseOptionalString(
                req.query.oohList,
              ),

            countryCode:
              parseOptionalString(
                req.query.countryCode,
              ),

            page:
              parsePositiveInteger(
                req.query.page,
                1,
              ),

            countPerPage:
              Math.min(
                parsePositiveInteger(
                  req.query.countPerPage,
                  500,
                ),
                500,
              ),
          });

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "SAMEDAY OOH LOCATIONS ERROR:",
        error,
      );

      return res.status(502).json({
        success: false,
        message:
          "Nu am putut încărca locațiile Easybox/PUDO.",
        error:
          getErrorMessage(error),
      });
    }
  },

  // ==========================================================
  // FIND AWB
  // ==========================================================

  async getAwbByReference(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const reference =
        String(
          req.params.reference ??
            "",
        ).trim();

      if (!reference) {
        return res.status(400).json({
          success: false,
          message:
            "Referința AWB este obligatorie.",
        });
      }

      const result =
        await samedayService
          .getAwbByInternalReference(
            reference,
          );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "SAMEDAY FIND AWB ERROR:",
        error,
      );

      return res.status(502).json({
        success: false,
        message:
          "Nu am putut găsi AWB-ul Sameday.",
        error:
          getErrorMessage(error),
      });
    }
  },

  // ==========================================================
  // STATUS SYNC
  // ==========================================================

  async getStatusSync(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const startTimestamp =
        parseOptionalString(
          req.query.startTimestamp,
        );

      const endTimestamp =
        parseOptionalString(
          req.query.endTimestamp,
        );

      if (
        !startTimestamp ||
        !endTimestamp
      ) {
        return res.status(400).json({
          success: false,
          message:
            "startTimestamp și endTimestamp sunt obligatorii.",
        });
      }

      const result =
        await samedayService
          .getStatusSync({
            startTimestamp,
            endTimestamp,

            page:
              parsePositiveInteger(
                req.query.page,
                1,
              ),

            countPerPage:
              Math.min(
                parsePositiveInteger(
                  req.query.countPerPage,
                  500,
                ),
                500,
              ),
          });

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "SAMEDAY STATUS SYNC ERROR:",
        error,
      );

      return res.status(502).json({
        success: false,
        message:
          "Nu am putut încărca statusurile Sameday.",
        error:
          getErrorMessage(error),
      });
    }
  },
};