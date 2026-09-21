import { Request, Response } from "express";
import * as promotionService from "./promotion.service.js";

interface AuthRequest extends Request {
  userId?: string;
}

export async function getPackages(
  _req: Request,
  res: Response,
) {
  try {
    const packages =
      await promotionService.getPromotionPackages();

    return res.json({
      success: true,
      data: packages,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ??
        "Eroare la încărcarea pachetelor de promovare.",
    });
  }
}

export async function createPromotion(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Neautorizat.",
      });
    }

    const {
      listingId,
      duration,
    } = req.body;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: "listingId este obligatoriu.",
      });
    }

    if (duration === undefined) {
      return res.status(400).json({
        success: false,
        message: "duration este obligatoriu.",
      });
    }

    const promotion =
      await promotionService.createPromotion(
        req.userId,
        String(listingId),
        Number(duration),
      );

    return res.status(201).json({
      success: true,
      data: promotion,
    });
  } catch (error: any) {
    const message =
      error?.message ??
      "Eroare la crearea promovării.";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function getMyPromotions(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Neautorizat.",
      });
    }

    const promotions =
      await promotionService.getMyPromotions(
        req.userId,
      );

    return res.json({
      success: true,
      data: promotions,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ??
        "Eroare la încărcarea promovărilor.",
    });
  }
}

export async function getListingPromotions(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Neautorizat.",
      });
    }

    const listingId =
      req.params.listingId as string;

    const promotions =
      await promotionService.getListingPromotions(
        req.userId,
        listingId,
      );

    return res.json({
      success: true,
      data: promotions,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ??
        "Eroare la încărcarea promovărilor.",
    });
  }
}

export async function getActivePromotion(
  req: Request,
  res: Response,
) {
  try {
    const listingId =
      req.params.listingId as string;

    const promotion =
      await promotionService.getActivePromotion(
        listingId,
      );

    return res.json({
      success: true,
      data: promotion,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ??
        "Eroare la verificarea promovării.",
    });
  }
}