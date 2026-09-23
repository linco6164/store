import { Request, Response } from "express";
import { calculateCheckout } from "./checkout.service.js";

interface AuthRequest extends Request {
  userId?: string;
}

export async function getCheckout(
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
      listingId,
      addressId,
      deliveryMethod,
    } = req.query;

    if (
      typeof listingId !== "string" ||
      typeof addressId !== "string" ||
      typeof deliveryMethod !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Date checkout incomplete.",
      });
    }

    if (
      deliveryMethod !== "courier" &&
      deliveryMethod !== "pickup_point"
    ) {
      return res.status(400).json({
        success: false,
        message: "Metoda de livrare este invalidă.",
      });
    }

    const data = await calculateCheckout(
      req.userId,
      listingId,
      addressId,
      deliveryMethod,
    );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(
      "[CHECKOUT]",
      error,
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nu s-a putut calcula checkout-ul.",
    });
  }
}