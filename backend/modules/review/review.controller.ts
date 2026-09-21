import { Request, Response } from "express";
import * as reviewService from "./review.service.js";

interface AuthRequest extends Request {
  userId?: string;
}

export async function create(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Nu ești autentificat.",
      });
    }

    const {
      sellerId,
      listingId,
      rating,
      comment,
    } = req.body;

    if (!sellerId || !listingId || rating == null) {
      return res.status(400).json({
        success: false,
        message:
          "sellerId, listingId și rating sunt obligatorii.",
      });
    }

    const review =
      await reviewService.createReview({
        reviewerId: req.userId,
        sellerId,
        listingId,
        rating: Number(rating),
        comment,
      });

    return res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu s-a putut crea evaluarea.",
    });
  }
}

export async function sellerReviews(
  req: Request,
  res: Response,
) {
  try {
    const sellerId = req.params.sellerId as string;

    const reviews =
      await reviewService.getSellerReviews(
        sellerId,
      );

    return res.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu s-au putut încărca evaluările.",
    });
  }
}

export async function sellerSummary(
  req: Request,
  res: Response,
) {
  try {
    const sellerId = req.params.sellerId as string;

    const summary =
      await reviewService.getSellerReviewSummary(
        sellerId,
      );

    return res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu s-a putut încărca ratingul.",
    });
  }
}

export async function remove(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Nu ești autentificat.",
      });
    }

    await reviewService.deleteReview(
      String(req.params.id),
      req.userId,
    );

    return res.json({
      success: true,
      message: "Evaluarea a fost ștearsă.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu s-a putut șterge evaluarea.",
    });
  }
}