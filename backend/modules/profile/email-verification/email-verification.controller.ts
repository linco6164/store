import { Response } from "express";
import { AuthRequest } from "../../../middleware/auth.js";
import {
  sendEmailVerification,
  verifyEmail,
} from "./email-verification.service.js";

export async function sendVerification(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await sendEmailVerification(req.userId);

    return res.json({
      success: true,
      message: "Codul de verificare a fost trimis pe email.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu s-a putut trimite codul de verificare.",
    });
  }
}

export async function verify(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const code = String(req.body?.code || "").trim();

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Codul trebuie să conțină 6 cifre.",
      });
    }

    await verifyEmail(req.userId, code);

    return res.json({
      success: true,
      message: "Adresa de email a fost verificată.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Codul de verificare este invalid.",
    });
  }
}