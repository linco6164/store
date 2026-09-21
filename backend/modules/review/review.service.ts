import mongoose from "mongoose";
import { ReviewModel } from "./review.model.js";

export interface CreateReviewPayload {
  reviewerId: string;
  sellerId: string;
  listingId: string;
  rating: number;
  comment?: string;
}

export async function createReview(
  payload: CreateReviewPayload,
) {
  const {
    reviewerId,
    sellerId,
    listingId,
    rating,
    comment,
  } = payload;

  if (!mongoose.isValidObjectId(reviewerId)) {
    throw new Error("Reviewer invalid.");
  }

  if (!mongoose.isValidObjectId(sellerId)) {
    throw new Error("Vânzător invalid.");
  }

  if (!mongoose.isValidObjectId(listingId)) {
    throw new Error("Anunț invalid.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error(
      "Evaluarea trebuie să fie între 1 și 5 stele.",
    );
  }

  if (reviewerId === sellerId) {
    throw new Error(
      "Nu îți poți evalua propriul anunț.",
    );
  }

  const existing = await ReviewModel.findOne({
    reviewer: reviewerId,
    listing: listingId,
  });

  if (existing) {
    throw new Error(
      "Ai evaluat deja acest anunț.",
    );
  }

  const review = await ReviewModel.create({
    reviewer: reviewerId,
    seller: sellerId,
    listing: listingId,
    rating,
    comment: comment?.trim() || undefined,
  });

  return ReviewModel.findById(review._id)
    .populate("reviewer", "username avatar")
    .populate("listing", "title images price")
    .lean();
}

export async function getSellerReviews(
  sellerId: string,
) {
  if (!mongoose.isValidObjectId(sellerId)) {
    throw new Error("Vânzător invalid.");
  }

  return ReviewModel.find({
    seller: sellerId,
  })
    .sort({
      createdAt: -1,
    })
    .populate("reviewer", "username avatar")
    .populate("listing", "title images price")
    .lean();
}

export async function getSellerReviewSummary(
  sellerId: string,
) {
  if (!mongoose.isValidObjectId(sellerId)) {
    throw new Error("Vânzător invalid.");
  }

  const result = await ReviewModel.aggregate([
    {
      $match: {
        seller: new mongoose.Types.ObjectId(sellerId),
      },
    },
    {
      $group: {
        _id: null,
        count: {
          $sum: 1,
        },
        average: {
          $avg: "$rating",
        },
      },
    },
  ]);

  if (!result.length) {
    return {
      count: 0,
      average: 0,
    };
  }

  return {
    count: result[0].count,
    average: Number(
      result[0].average.toFixed(1),
    ),
  };
}

export async function deleteReview(
  reviewId: string,
  userId: string,
) {
  const review = await ReviewModel.findOne({
    _id: reviewId,
    reviewer: userId,
  });

  if (!review) {
    throw new Error(
      "Evaluarea nu există sau nu îți aparține.",
    );
  }

  await ReviewModel.deleteOne({
    _id: reviewId,
  });
}