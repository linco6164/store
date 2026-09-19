import mongoose from "mongoose";

import { AddressModel } from "./address.model.js";

interface AddressPayload {
  county?: string;
  city?: string;
  street?: string;
  number?: string;
  building?: string;
  staircase?: string;
  floor?: string;
  apartment?: string;
  postalCode?: string;
  isDefault?: boolean;
}

class AddressService {
  async getAddresses(userId: string) {
    return AddressModel.find({
      user: userId,
    }).sort({
      isDefault: -1,
      createdAt: -1,
    });
  }

  async createAddress(
    userId: string,
    payload: AddressPayload,
  ) {
    const address = await AddressModel.create({
      user: userId,
      county: payload.county ?? "",
      city: payload.city ?? "",
      street: payload.street ?? "",
      number: payload.number ?? "",
      building: payload.building,
      staircase: payload.staircase,
      floor: payload.floor,
      apartment: payload.apartment,
      postalCode: payload.postalCode,
      isDefault: payload.isDefault === true,
    });

    if (address.isDefault) {
      await AddressModel.updateMany(
        {
          user: userId,
          _id: {
            $ne: address._id,
          },
        },
        {
          $set: {
            isDefault: false,
          },
        },
      );
    }

    return address;
  }

  async updateAddress(
    userId: string,
    addressId: string,
    payload: AddressPayload,
  ) {
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      throw new Error("INVALID_ADDRESS_ID");
    }

    const address = await AddressModel.findOne({
      _id: addressId,
      user: userId,
    });

    if (!address) {
      throw new Error("ADDRESS_NOT_FOUND");
    }

    if (payload.county !== undefined) {
      address.county = payload.county;
    }

    if (payload.city !== undefined) {
      address.city = payload.city;
    }

    if (payload.street !== undefined) {
      address.street = payload.street;
    }

    if (payload.number !== undefined) {
      address.number = payload.number;
    }

    if (payload.building !== undefined) {
      address.building = payload.building;
    }

    if (payload.staircase !== undefined) {
      address.staircase = payload.staircase;
    }

    if (payload.floor !== undefined) {
      address.floor = payload.floor;
    }

    if (payload.apartment !== undefined) {
      address.apartment = payload.apartment;
    }

    if (payload.postalCode !== undefined) {
      address.postalCode = payload.postalCode;
    }

    if (payload.isDefault !== undefined) {
      address.isDefault = payload.isDefault;
    }

    await address.save();

    if (address.isDefault) {
      await AddressModel.updateMany(
        {
          user: userId,
          _id: {
            $ne: address._id,
          },
        },
        {
          $set: {
            isDefault: false,
          },
        },
      );
    }

    return address;
  }

  async deleteAddress(
    userId: string,
    addressId: string,
  ) {
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      throw new Error("INVALID_ADDRESS_ID");
    }

    const address =
      await AddressModel.findOneAndDelete({
        _id: addressId,
        user: userId,
      });

    if (!address) {
      throw new Error("ADDRESS_NOT_FOUND");
    }

    return address;
  }

  async setDefaultAddress(
    userId: string,
    addressId: string,
  ) {
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      throw new Error("INVALID_ADDRESS_ID");
    }

    const address = await AddressModel.findOne({
      _id: addressId,
      user: userId,
    });

    if (!address) {
      throw new Error("ADDRESS_NOT_FOUND");
    }

    await AddressModel.updateMany(
      {
        user: userId,
      },
      {
        $set: {
          isDefault: false,
        },
      },
    );

    address.isDefault = true;

    await address.save();

    return address;
  }
}

export const addressService =
  new AddressService();