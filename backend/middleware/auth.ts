import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import User from "../models/Users.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export default async function auth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const token = header.substring(7);

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as {
      id: string;
    };

    const user = await User.findById(
      decoded.id,
    ).select("_id banned");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.banned) {
      return res.status(403).json({
        success: false,
        code: "ACCOUNT_BANNED",
        message:
          "Contul tău a fost blocat de administrator.",
      });
    }

    req.userId = user._id.toString();

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}