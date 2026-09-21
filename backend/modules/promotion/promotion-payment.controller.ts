import type { Request, Response } from "express";

import {
  createPromotionPayment,
  getPromotionPayment,
  handlePromotionNotification,
} from "./promotion-payment.service.js";

interface AuthRequest extends Request {
  userId?: string;
}

/**
 * POST /promotions/payment/create
 */
export async function createPromotionPaymentController(
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

    const { promotionId } = req.body;

    if (!promotionId || typeof promotionId !== "string") {
      return res.status(400).json({
        success: false,
        message: "promotionId este obligatoriu.",
      });
    }

    const result = await createPromotionPayment(
      req.userId,
      promotionId,
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error(
      "[PROMOTION PAYMENT CREATE]",
      error,
    );

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nu s-a putut crea plata promovării.",
    });
  }
}

/**
 * GET /promotions/payment/:id
 */
export async function getPromotionPaymentController(
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

    const { id } = req.params;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "ID-ul plății este obligatoriu.",
      });
    }

    const payment = await getPromotionPayment(
      req.userId,
      id,
    );

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error(
      "[PROMOTION PAYMENT GET]",
      error,
    );

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Plata nu a fost găsită.",
    });
  }
}

/**
 * POST /promotions/payment/confirm
 *
 * Endpoint public apelat de NETOPIA.
 */
export async function confirmPromotionPayment(
  req: Request,
  res: Response,
) {
  try {
    const envKey =
      req.body?.env_key ??
      req.body?.envKey;

    const data = req.body?.data;

    const cipher =
      req.body?.cipher ??
      req.body?.cipher_name;

    const iv =
      req.body?.iv ??
      req.body?.IV;

    if (
      typeof envKey !== "string" ||
      typeof data !== "string"
    ) {
      return res
        .status(400)
        .type("application/xml")
        .send(
          '<?xml version="1.0" encoding="utf-8"?><crc error_type="1" error_code="400">Lipsesc datele NETOPIA.</crc>',
        );
    }

    await handlePromotionNotification({
      envKey,
      data,
      cipher:
        typeof cipher === "string"
          ? cipher
          : undefined,
      iv:
        typeof iv === "string"
          ? iv
          : undefined,
    });

    return res
      .status(200)
      .type("application/xml")
      .send(
        '<?xml version="1.0" encoding="utf-8"?><crc>OK</crc>',
      );
  } catch (error) {
    console.error(
      "[PROMOTION PAYMENT CONFIRM]",
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : "Eroare la procesarea plății.";

    return res
      .status(200)
      .type("application/xml")
      .send(
        `<?xml version="1.0" encoding="utf-8"?><crc error_type="1" error_code="500">${escapeXml(message)}</crc>`,
      );
  }
}

/**
 * GET /promotions/payment/return
 *
 * NETOPIA redirecționează utilizatorul aici
 * după checkout.
 */
export async function promotionPaymentReturn(
  req: Request,
  res: Response,
) {
  const rawPaymentId = req.query.paymentId;
  const rawStatus = req.query.status;

  const paymentId =
    typeof rawPaymentId === "string"
      ? rawPaymentId
      : "";

  const status =
    typeof rawStatus === "string"
      ? rawStatus
      : "pending";

  const frontendUrl =
    process.env.NETOPIA_PROMOTION_FRONTEND_RETURN_URL ??
    "https://nx-store.com/promotion/payment-return";

  const separator = frontendUrl.includes("?")
    ? "&"
    : "?";

  const redirectUrl =
    `${frontendUrl}${separator}` +
    `paymentId=${encodeURIComponent(paymentId)}` +
    `&status=${encodeURIComponent(status)}`;

  return res.redirect(302, redirectUrl);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}