import { Response } from "express";

import { AuthRequest } from "../../middleware/auth.js";

import { addressService } from "./address.service.js";

class AddressController {
  async list(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      const addresses =
        await addressService.getAddresses(
          req.userId!,
        );

      return res.json({
        success: true,
        data: addresses,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Eroare la încărcarea adreselor.",
      });
    }
  }

  async create(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      const address =
        await addressService.createAddress(
          req.userId!,
          req.body,
        );

      return res.status(201).json({
        success: true,
        data: address,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Eroare la crearea adresei.",
      });
    }
  }

  async update(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      const address =
        await addressService.updateAddress(
          req.userId!,
          String(req.params.id),
          req.body,
        );

      return res.json({
        success: true,
        data: address,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "INVALID_ADDRESS_ID"
      ) {
        return res.status(400).json({
          success: false,
          message: "ID adresă invalid.",
        });
      }

      if (
        error instanceof Error &&
        error.message ===
          "ADDRESS_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Adresa nu există.",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Eroare la actualizarea adresei.",
      });
    }
  }

  async delete(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      await addressService.deleteAddress(
        req.userId!,
        String(req.params.id),
      );

      return res.json({
        success: true,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "INVALID_ADDRESS_ID"
      ) {
        return res.status(400).json({
          success: false,
          message: "ID adresă invalid.",
        });
      }

      if (
        error instanceof Error &&
        error.message ===
          "ADDRESS_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Adresa nu există.",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Eroare la ștergerea adresei.",
      });
    }
  }

  async setDefault(
    req: AuthRequest,
    res: Response,
  ) {
    try {
      const address =
        await addressService.setDefaultAddress(
          req.userId!,
          String(req.params.id),
        );

      return res.json({
        success: true,
        data: address,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "INVALID_ADDRESS_ID"
      ) {
        return res.status(400).json({
          success: false,
          message: "ID adresă invalid.",
        });
      }

      if (
        error instanceof Error &&
        error.message ===
          "ADDRESS_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message: "Adresa nu există.",
        });
      }

      console.error(error);

      return res.status(500).json({
        success: false,
        message:
          "Eroare la setarea adresei implicite.",
      });
    }
  }
}

export const addressController =
  new AddressController();