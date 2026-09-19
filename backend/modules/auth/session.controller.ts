import { Response } from "express";
import { AuthRequest } from "../../middleware/auth.js";
import {
  getUserSessions,
  deleteSession,
  deleteOtherSessions,
} from "./session.service.js";

export async function getSessions(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const sessions = await getUserSessions(req.userId);

    const data = sessions.map((session) => ({
      id: session.sessionId,
      deviceName: session.deviceName,
      platform: session.platform,
      browser: session.browser,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      lastActiveAt: session.lastActiveAt,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      isCurrent: session.sessionId === req.sessionId,
    }));

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get sessions error:", error);

    return res.status(500).json({
      success: false,
      message: "Nu s-au putut încărca sesiunile.",
    });
  }
}

export async function removeSession(req: AuthRequest, res: Response) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const sessionIdParam = req.params.sessionId;

    const sessionId = Array.isArray(sessionIdParam)
      ? sessionIdParam[0]
      : sessionIdParam;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Lipsește sessionId.",
      });
    }

    const session = await deleteSession(req.userId, sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Sesiunea nu a fost găsită.",
      });
    }

    return res.json({
      success: true,
      message: "Sesiunea a fost închisă.",
    });
  } catch (error) {
    console.error("Delete session error:", error);

    return res.status(500).json({
      success: false,
      message: "Sesiunea nu a putut fi închisă.",
    });
  }
}

export async function removeOtherSessions(req: AuthRequest, res: Response) {
  try {
    if (!req.userId || !req.sessionId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await deleteOtherSessions(req.userId, req.sessionId);

    return res.json({
      success: true,
      deletedCount: result.deletedCount,
      message: "Celelalte sesiuni au fost închise.",
    });
  } catch (error) {
    console.error("Delete other sessions error:", error);

    return res.status(500).json({
      success: false,
      message: "Celelalte sesiuni nu au putut fi închise.",
    });
  }
}
