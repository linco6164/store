import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;

  label: string;

  fullName: string;
  phone: string;

  county: string;
  city: string;

  street: string;
  number: string;

  building?: string;
  apartment?: string;

  postalCode?: string;

  isDefault: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    label: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },

    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    county: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    street: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    number: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    building: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    apartment: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    postalCode: {
      type: String,
      trim: true,
      maxlength: 20,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const AddressModel = mongoose.model<IAddress>(
  "Address",
  addressSchema,
);