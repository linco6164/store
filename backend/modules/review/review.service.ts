import mongoose from "mongoose";
import { ReviewModel } from "./review.model.js";
import OrderModel from "../order/order.model.js";

interface CreateReviewPayload {
  reviewerId: string;
  orderId: string;
  rating: number;
  comment?: string;
}

export async function createReview({
  reviewerId,
  orderId,
  rating,
  comment,
}: CreateReviewPayload) {
  if (!mongoose.Types.ObjectId.isValid(reviewerId)) {
    throw new Error("ID-ul cumpărătorului este invalid.");
  }

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    throw new Error("ID-ul comenzii este invalid.");
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating-ul trebuie să fie între 1 și 5.");
  }

  const order = await OrderModel.findOne({
    _id: orderId,
    buyer: reviewerId,
  });

  if (!order) {
    throw new Error(
      "Comanda nu există sau nu aparține utilizatorului autentificat.",
    );
  }

  if (order.status !== "completed") {
    throw new Error(
      "Poți evalua vânzătorul doar după finalizarea comenzii.",
    );
  }

  const existingReview = await ReviewModel.findOne({
    reviewer: reviewerId,
    order: order._id,
  });

  if (existingReview) {
    throw new Error("Ai evaluat deja această comandă.");
  }

  const review = await ReviewModel.create({
    reviewer: reviewerId,
    seller: order.seller,
    listing: order.listing,
    order: order._id,
    rating,
    comment:
      comment && comment.trim().length > 0
        ? comment.trim()
        : undefined,
  });

  return ReviewModel.findById(review._id)
    .populate("reviewer", "username avatar")
    .populate("seller", "username avatar")
    .populate("listing", "title images price currency")
    .populate("order", "amount currency status");
}

export async function getSellerReviews(sellerId: string) {
  if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    throw new Error("ID-ul vânzătorului este invalid.");
  }

  return ReviewModel.find({
    seller: sellerId,
  })
    .populate("reviewer", "username avatar")
    .populate("listing", "title images price currency")
    .sort({ createdAt: -1 });
}

export async function getSellerReviewSummary(sellerId: string) {
  if (!mongoose.Types.ObjectId.isValid(sellerId)) {
    throw new Error("ID-ul vânzătorului este invalid.");
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
        count: { $sum: 1 },
        averageRating: { $avg: "$rating" },
        fiveStars: {
          $sum: {
            $cond: [{ $eq: ["$rating", 5] }, 1, 0],
          },
        },
        fourStars: {
          $sum: {
            $cond: [{ $eq: ["$rating", 4] }, 1, 0],
          },
        },
        threeStars: {
          $sum: {
            $cond: [{ $eq: ["$rating", 3] }, 1, 0],
          },
        },
        twoStars: {
          $sum: {
            $cond: [{ $eq: ["$rating", 2] }, 1, 0],
          },
        },
        oneStar: {
          $sum: {
            $cond: [{ $eq: ["$rating", 1] }, 1, 0],
          },
        },
      },
    },
  ]);

  if (!result.length) {
    return {
      count: 0,
      averageRating: 0,
      fiveStars: 0,
      fourStars: 0,
      threeStars: 0,
      twoStars: 0,
      oneStar: 0,
    };
  }

  return {
    count: result[0].count,
    averageRating: Number(
      Number(result[0].averageRating).toFixed(1),
    ),
    fiveStars: result[0].fiveStars,
    fourStars: result[0].fourStars,
    threeStars: result[0].threeStars,
    twoStars: result[0].twoStars,
    oneStar: result[0].oneStar,
  };
}

export async function deleteReview(
  reviewId: string,
  userId: string,
) {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new Error("ID-ul evaluării este invalid.");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("ID-ul utilizatorului este invalid.");
  }

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

  return {
    success: true,
  };
}