import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  reviewer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;

  rating: number;
  comment?: string;

  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  },
);

// Un cumpărător poate evalua o singură dată
// un anumit anunț.
reviewSchema.index(
  {
    reviewer: 1,
    listing: 1,
  },
  {
    unique: true,
  },
);

export const ReviewModel = mongoose.model<IReview>(
  "Review",
  reviewSchema,
);