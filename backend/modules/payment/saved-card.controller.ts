import { Request, Response } from "express";

import {
  getSavedCards,
  setDefaultCard,
  deleteSavedCard,
} from "./saved-card.service.js";

interface AuthRequest extends Request {
  userId?: string;
}

export async function getCards(
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

    const cards = await getSavedCards(
      req.userId,
    );

    return res.json({
      success: true,
      data: cards,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nu s-au putut încărca cardurile.",
    });
  }
}

export async function makeDefaultCard(
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

    const card = await setDefaultCard(
      req.userId,
      req.params.id as string,
    );

    return res.json({
      success: true,
      data: card,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nu s-a putut selecta cardul.",
    });
  }
}

export async function removeCard(
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

    await deleteSavedCard(
      req.userId,
      req.params.id as string,
    );

    return res.json({
      success: true,
      message: "Cardul a fost șters.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nu s-a putut șterge cardul.",
    });
  }
}