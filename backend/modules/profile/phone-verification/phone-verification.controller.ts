import { Response } from "express";
import { AuthRequest } from "../../../middleware/auth.js";
import {
  sendPhoneVerification,
  verifyPhone,
  requestPhoneChange,
  confirmPhoneChange,
} from "./phone-verification.service.js";

export async function send(
  req: AuthRequest,
  res: Response,
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Neautorizat.",
      });
    }

    const result = await sendPhoneVerification(
      req.userId,
    );

    return res.json(result);
  } catch (error: any) {
    console.error(
      "PHONE VERIFICATION SEND ERROR:",
      error,
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu am putut trimite codul SMS.",
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
        message: "Neautorizat.",
      });
    }

    const { code } = req.body;

    const result = await verifyPhone(
      req.userId,
      code,
    );

    return res.json(result);
  } catch (error: any) {
    console.error(
      "PHONE VERIFICATION VERIFY ERROR:",
      error,
    );

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
        message: "Neautorizat.",
      });
    }

    const {
      newPhone,
      currentPassword,
    } = req.body;

    const result = await requestPhoneChange(
      req.userId,
      newPhone,
      currentPassword,
    );

    return res.json(result);
  } catch (error: any) {
    console.error(
      "PHONE CHANGE REQUEST ERROR:",
      error,
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu am putut solicita schimbarea numărului.",
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
        message: "Neautorizat.",
      });
    }

    const { code } = req.body;

    const result = await confirmPhoneChange(
      req.userId,
      code,
    );

    return res.json(result);
  } catch (error: any) {
    console.error(
      "PHONE CHANGE CONFIRM ERROR:",
      error,
    );

    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Nu am putut confirma schimbarea numărului.",
    });
  }
}