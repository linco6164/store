import type { Request, Response } from "express";

import { PromotionPaymentModel } from "./promotion-payment.model.js";

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

    const result = await createPromotionPayment(req.userId, promotionId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[PROMOTION PAYMENT CREATE]", error);

    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Nu s-a putut crea plata promovării.",
    });
  }
}

export async function promotionPaymentCheckout(req: Request, res: Response) {
  try {
    const gatewayUrl = String(req.query.gatewayUrl ?? "");
    const envKey = String(req.query.env_key ?? "");
    const data = String(req.query.data ?? "");
    const cipher = String(req.query.cipher ?? "");
    const iv = String(req.query.iv ?? "");

    if (!gatewayUrl || !envKey || !data || !cipher || !iv) {
      return res.status(400).send("Date NETOPIA incomplete.");
    }

    const html = `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >
  <title>NETOPIA Checkout</title>
</head>
<body>
  <p>Se deschide pagina de plată...</p>

  <form
    id="netopia-form"
    method="POST"
    action="${gatewayUrl}"
  >
    <input
      type="hidden"
      name="env_key"
      value="${envKey}"
    />

    <input
      type="hidden"
      name="data"
      value="${data}"
    />

    <input
      type="hidden"
      name="cipher"
      value="${cipher}"
    />

    <input
      type="hidden"
      name="iv"
      value="${iv}"
    />
  </form>

  <script>
    document.getElementById("netopia-form").submit();
  </script>
</body>
</html>
`;

    res.status(200).set("Content-Type", "text/html; charset=utf-8").send(html);
  } catch (error) {
    console.error("[PROMOTION PAYMENT CHECKOUT]", error);

    return res.status(500).send("Nu s-a putut deschide checkout-ul NETOPIA.");
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

    const payment = await getPromotionPayment(req.userId, id);

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error("[PROMOTION PAYMENT GET]", error);

    return res.status(404).json({
      success: false,
      message:
        error instanceof Error ? error.message : "Plata nu a fost găsită.",
    });
  }
}

/**
 * POST /promotions/payment/confirm
 *
 * Endpoint public apelat de NETOPIA.
 */
export async function confirmPromotionPayment(req: Request, res: Response) {
  try {
    const envKey = req.body?.env_key ?? req.body?.envKey;

    const data = req.body?.data;

    const cipher = req.body?.cipher ?? req.body?.cipher_name;

    const iv = req.body?.iv ?? req.body?.IV;

    if (typeof envKey !== "string" || typeof data !== "string") {
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
      cipher: typeof cipher === "string" ? cipher : undefined,
      iv: typeof iv === "string" ? iv : undefined,
    });

    return res
      .status(200)
      .type("application/xml")
      .send('<?xml version="1.0" encoding="utf-8"?><crc>OK</crc>');
  } catch (error) {
    console.error("[PROMOTION PAYMENT CONFIRM]", error);

    const message =
      error instanceof Error ? error.message : "Eroare la procesarea plății.";

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
  res: Response
) {
  try {
    const rawOrderId =
      req.query.orderId ??
      req.query.orderID ??
      req.query.order_id ??
      req.query.paymentId;

    const rawStatus = req.query.status;

    const orderId =
      typeof rawOrderId === "string"
        ? rawOrderId
        : "";

    const status =
      typeof rawStatus === "string"
        ? rawStatus
        : "pending";

    let paymentId = "";

    if (orderId) {
      const payment =
        await PromotionPaymentModel.findOne({
          providerOrderId: orderId,
        }).select("_id status");

      if (payment) {
        paymentId = String(payment._id);

        console.log(
          "[PROMOTION PAYMENT RETURN]",
          {
            orderId,
            paymentId,
            status: payment.status,
          }
        );
      } else {
        console.warn(
          "[PROMOTION PAYMENT RETURN] Payment not found",
          {
            orderId,
          }
        );
      }
    }

    const frontendReturnUrl =
      process.env.NETOPIA_PROMOTION_FRONTEND_RETURN_URL ??
      "https://nx-store.shop/promotion/payment-return";

    const separator =
      frontendReturnUrl.includes("?")
        ? "&"
        : "?";

    const redirectUrl =
      `${frontendReturnUrl}${separator}` +
      `paymentId=${encodeURIComponent(paymentId)}` +
      `status=${encodeURIComponent(status)}` +
      `orderId=${encodeURIComponent(orderId)}`;

    console.log(
      "[PROMOTION PAYMENT RETURN] Redirect:",
      redirectUrl
    );

    return res.redirect(302, redirectUrl);
  } catch (error) {
    console.error(
      "[PROMOTION PAYMENT RETURN] Error:",
      error
    );

    return res.status(500).send(
      "Nu s-a putut procesa return-ul plății."
    );
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
