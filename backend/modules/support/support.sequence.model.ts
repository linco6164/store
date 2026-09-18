import mongoose from "mongoose";

const SupportSequenceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },

    value: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    versionKey: false,
  },
);

export const SupportSequence =
  mongoose.model(
    "SupportSequence",
    SupportSequenceSchema,
    "support_sequences",
  );