import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/Users.js";

export interface SupportAuthRequest extends Request {
  userId?: string;
  isBanned?: boolean;
}

export default async function supportAuth(
  req: SupportAuthRequest,
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

    const user = await User.findById(decoded.id).select(
      "_id banned",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    req.userId = user._id.toString();
    req.isBanned = user.banned === true;

    next();
  } catch (error) {
    console.error("SUPPORT AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}