import { Response, NextFunction } from "express";
import User from "../models/Users.js";
import { AuthRequest } from "./auth.js";

export default async function financeAccess(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.userId).select(
      "_id role department banned",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.banned) {
      return res.status(403).json({
        success: false,
        message: "Contul este blocat.",
      });
    }

    if (user.role === "admin") {
      return next();
    }

    if (
      user.role === "finance_agent" &&
      user.department === "payments"
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: "Nu ai acces la departamentul Plăți.",
    });
  } catch (error) {
    console.error("FINANCE ACCESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Eroare de autorizare.",
    });
  }
}