import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import User from "../models/Users.js";
import UserSession from "../modules/auth/session.model.js";
import { updateLastActive } from "../modules/auth/session.service.js";

export interface AuthRequest extends Request {
  userId?: string;
  sessionId?: string;
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
      sessionId?: string;
    };

    // ============================================================
    // SESIUNE
    // ============================================================

    if (!decoded.sessionId) {
      return res.status(401).json({
        success: false,
        code: "SESSION_REQUIRED",
        message:
          "Sesiunea nu este validă. Te rugăm să te autentifici din nou.",
      });
    }

    const session = await UserSession.findOne({
      sessionId: decoded.sessionId,
      user: decoded.id,
      expiresAt: {
        $gt: new Date(),
      },
    });

    if (!session) {
      return res.status(401).json({
        success: false,
        code: "SESSION_EXPIRED",
        message:
          "Sesiunea a expirat sau a fost închisă.",
      });
    }

    // ============================================================
    // USER
    // ============================================================

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

    // ============================================================
    // ACTUALIZĂM ULTIMA ACTIVITATE
    // ============================================================

    await updateLastActive(
      decoded.sessionId,
    );

    req.userId = user._id.toString();
    req.sessionId = decoded.sessionId;

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
}