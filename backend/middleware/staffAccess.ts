import { Response, NextFunction } from "express";
import User from "../models/Users.js";
import { AuthRequest } from "./auth.js";

const STAFF_ROLES = [
  "support_agent",
  "support_manager",
  "it_agent",
  "finance_agent",
  "logistics_agent",
  "moderator",
];

export default async function staffAccess(
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

    /*
     * Administratorul are acces automat.
     */
    if (user.role === "admin") {
      return next();
    }

    /*
     * Verificăm dacă este staff.
     */
    if (!STAFF_ROLES.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: "Acces interzis.",
      });
    }

    next();
  } catch (error) {
    console.error("STAFF ACCESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Eroare de autorizare.",
    });
  }
}