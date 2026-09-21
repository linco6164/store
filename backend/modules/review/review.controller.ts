import { Request, Response } from "express";
import * as reviewService from "./review.service.js";

interface AuthRequest extends Request {
  userId?: string;
}

export async function createReview(
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
      orderId,
      rating,
      comment,
    } = req.body;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId este obligatoriu.",
      });
    }

    if (rating === undefined || rating === null) {
      return res.status(400).json({
        success: false,
        message: "Rating-ul este obligatoriu.",
      });
    }

    const review = await reviewService.createReview({
      reviewerId: req.userId,
      orderId: String(orderId),
      rating: Number(rating),
      comment:
        comment !== undefined && comment !== null
          ? String(comment)
          : undefined,
    });

    return res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error: any) {
    console.error("❌ createReview:", error);

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu s-a putut crea evaluarea.",
    });
  }
}

export async function getSellerReviews(
  req: Request,
  res: Response,
) {
  try {
    const sellerId = req.params.sellerId as string;

    const reviews =
      await reviewService.getSellerReviews(sellerId);

    return res.json({
      success: true,
      data: reviews,
    });
  } catch (error: any) {
    console.error("❌ getSellerReviews:", error);

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu s-au putut încărca evaluările.",
    });
  }
}

export async function getSellerReviewSummary(
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
    console.error(
      "❌ getSellerReviewSummary:",
      error,
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu s-a putut încărca sumarul evaluărilor.",
    });
  }
}

export async function deleteReview(
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

    const reviewId = req.params.id as string;

    const result =
      await reviewService.deleteReview(
        reviewId,
        req.userId,
      );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("❌ deleteReview:", error);

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu s-a putut șterge evaluarea.",
    });
  }
}