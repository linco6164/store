import { Response } from "express";
import { AuthRequest } from "../../../middleware/auth.js";
import {
  sendEmailVerification,
  verifyEmail,
  requestEmailChange,
  confirmEmailChange,
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

export async function requestChange(
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

    const newEmail = String(
      req.body?.newEmail || "",
    ).trim();

    const currentPassword = String(
      req.body?.currentPassword || "",
    );

    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: "Noua adresă de email este obligatorie.",
      });
    }

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: "Parola actuală este obligatorie.",
      });
    }

    await requestEmailChange(
      req.userId,
      newEmail,
      currentPassword,
    );

    return res.json({
      success: true,
      message:
        "Codul de confirmare a fost trimis pe noua adresă de email.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu s-a putut solicita schimbarea emailului.",
    });
  }
}

export async function confirmChange(
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

    const code = String(
      req.body?.code || "",
    ).trim();

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message:
          "Codul trebuie să conțină 6 cifre.",
      });
    }

    await confirmEmailChange(
      req.userId,
      code,
    );

    return res.json({
      success: true,
      message:
        "Adresa de email a fost schimbată cu succes.",
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu s-a putut confirma schimbarea emailului.",
    });
  }
}