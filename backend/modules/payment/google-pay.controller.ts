import { Request, Response } from "express";

import { AuthRequest } from "../../middleware/auth.js";
import { paymentService } from "./payment.service.js";

function publicApiBaseUrl(req: Request): string {
  const configured = String(process.env.API_PUBLIC_URL ?? "").trim();

  if (configured) {
    const url = new URL(configured);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("API_PUBLIC_URL_INVALID");
    }

    return url.origin;
  }

  const forwardedProto = String(req.headers["x-forwarded-proto"] ?? "")
    .split(",")[0]
    .trim();
  const protocol = forwardedProto || req.protocol;
  const host = req.get("host");

  if (!host || (protocol !== "https" && protocol !== "http")) {
    throw new Error("API_PUBLIC_URL_INVALID");
  }

  return `${protocol}://${host}`;
}

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function actionHtml(actionUrl: string, formData: Record<string, string>) {
  const inputs = Object.entries(formData)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`,
    )
    .join("\n");

  return `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nexora - Confirmare Google Pay</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center;
      background: #0e1511; color: #f4f8f5; font-family: Arial, sans-serif; }
    main { max-width: 420px; padding: 32px; text-align: center; }
    .loader { width: 42px; height: 42px; margin: 0 auto 20px;
      border: 4px solid #26352b; border-top-color: #9cdda9;
      border-radius: 50%; animation: spin .8s linear infinite; }
    h1 { margin: 0 0 10px; font-size: 22px; }
    p { margin: 0; color: #b8c7bd; line-height: 1.5; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <main>
    <div class="loader"></div>
    <h1>Confirmare securizată</h1>
    <p>Vei fi redirecționat către pagina băncii pentru autorizarea plății.</p>
  </main>
  <form id="google-pay-3ds" method="POST" action="${escapeHtml(actionUrl)}">
    ${inputs}
  </form>
  <script>document.getElementById("google-pay-3ds").submit();</script>
</body>
</html>`;
}

function resultHtml(paymentId: string, success: boolean, message: string) {
  const deepLink = `nexora://payment-return?paymentId=${encodeURIComponent(paymentId)}`;
  const color = success ? "#9cdda9" : "#ffb4ab";

  return `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nexora - Rezultat plată</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center;
      background: #0e1511; color: #f4f8f5; font-family: Arial, sans-serif; }
    main { max-width: 460px; padding: 32px; text-align: center; }
    .icon { margin: 0 auto 18px; color: ${color}; font-size: 46px; }
    h1 { margin: 0 0 10px; font-size: 24px; }
    p { margin: 0 0 22px; color: #b8c7bd; line-height: 1.5; }
    a { display: inline-block; padding: 12px 20px; border-radius: 12px;
      background: #9cdda9; color: #102116; font-weight: 700;
      text-decoration: none; }
  </style>
</head>
<body>
  <main>
    <div class="icon">${success ? "✓" : "!"}</div>
    <h1>${success ? "Plată confirmată" : "Plata nu a fost confirmată"}</h1>
    <p>${escapeHtml(message)}</p>
    <a href="${escapeHtml(deepLink)}">Înapoi în Nexora</a>
  </main>
</body>
</html>`;
}

function errorResponse(error: unknown) {
  const code = error instanceof Error ? error.message : "";

  if (
    code === "INVALID_GOOGLE_PAY_DATA" ||
    code === "INVALID_GOOGLE_PAY_TOKEN" ||
    code === "INVALID_GOOGLE_PAY_3DS_RESPONSE" ||
    code === "INVALID_DELIVERY_METHOD" ||
    code === "EASYBOX_REQUIRED"
  ) {
    return { status: 400, message: "Datele plății Google Pay sunt invalide." };
  }

  if (code === "CHECKOUT_TOTAL_CHANGED") {
    return {
      status: 409,
      message: "Totalul comenzii s-a modificat. Reîncarcă pagina de checkout.",
    };
  }

  if (
    code === "PAYMENT_NOT_FOUND" ||
    code === "LISTING_NOT_AVAILABLE" ||
    code === "ADDRESS_NOT_FOUND"
  ) {
    return { status: 404, message: "Plata sau datele comenzii nu mai sunt disponibile." };
  }

  if (code.startsWith("NETOPIA_GOOGLE_PAY_DECLINED:")) {
    return {
      status: 402,
      message: code.split(":").slice(1).join(":") || "Plata a fost refuzată.",
    };
  }

  if (
    code.startsWith("GOOGLE_PAY_CONFIG_MISSING:") ||
    code === "API_PUBLIC_URL_INVALID"
  ) {
    return { status: 503, message: "Google Pay nu este configurat complet." };
  }

  if (code === "NETOPIA_GOOGLE_PAY_TIMEOUT") {
    return { status: 504, message: "NETOPIA nu a răspuns la timp." };
  }

  if (
    code === "NETOPIA_GOOGLE_PAY_UNAVAILABLE" ||
    code === "NETOPIA_GOOGLE_PAY_INVALID_RESPONSE" ||
    code.startsWith("NETOPIA_GOOGLE_PAY_HTTP_")
  ) {
    return { status: 502, message: "NETOPIA nu este disponibil momentan." };
  }

  return { status: 500, message: "Plata Google Pay nu a putut fi procesată." };
}

export const googlePayController = {
  async configuration(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      return res.status(200).json({
        success: true,
        data: paymentService.getGooglePayConfiguration(),
      });
    } catch (error) {
      const failure = errorResponse(error);
      return res.status(failure.status).json({ success: false, message: failure.message });
    }
  },

  async complete(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const {
        listingId,
        addressId,
        deliveryMethod,
        destinationLockerId,
        expectedAmount,
        paymentData,
      } = req.body ?? {};

      if (typeof listingId !== "string" || !listingId.trim()) {
        return res.status(400).json({ success: false, message: "listingId este obligatoriu." });
      }

      if (typeof addressId !== "string" || !addressId.trim()) {
        return res.status(400).json({ success: false, message: "addressId este obligatoriu." });
      }

      if (deliveryMethod !== "courier" && deliveryMethod !== "pickup_point") {
        return res.status(400).json({ success: false, message: "Metoda de livrare este invalidă." });
      }

      const parsedExpectedAmount = Number(expectedAmount);
      if (!Number.isFinite(parsedExpectedAmount) || parsedExpectedAmount <= 0) {
        return res.status(400).json({ success: false, message: "Totalul checkout-ului este invalid." });
      }

      let parsedLockerId: number | undefined;
      if (deliveryMethod === "pickup_point") {
        parsedLockerId = Number(destinationLockerId);
        if (!Number.isInteger(parsedLockerId) || parsedLockerId <= 0) {
          return res.status(400).json({ success: false, message: "Selectează un Easybox." });
        }
      }

      const result = await paymentService.processGooglePay({
        buyerId: req.userId,
        listingId: listingId.trim(),
        addressId: addressId.trim(),
        deliveryMethod,
        destinationLockerId: parsedLockerId,
        expectedAmount: parsedExpectedAmount,
        paymentData,
        apiBaseUrl: publicApiBaseUrl(req),
        userAgent: req.get("user-agent") ?? undefined,
        ipAddress: req.ip,
      });

      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error(
        "GOOGLE PAY ERROR:",
        error instanceof Error ? error.message : "UNKNOWN_ERROR",
      );
      const failure = errorResponse(error);
      return res.status(failure.status).json({ success: false, message: failure.message });
    }
  },

  async action(req: Request, res: Response) {
    try {
      const paymentId = String(req.params.id ?? "");
      const state = String(req.query.state ?? "");
      const action = await paymentService.getGooglePayAction(paymentId, state);

      res.set("Cache-Control", "no-store");
      return res.status(200).type("html").send(actionHtml(action.actionUrl, action.formData));
    } catch (_) {
      return res.status(400).type("html").send(
        resultHtml(String(req.params.id ?? ""), false, "Sesiunea de confirmare nu mai este validă."),
      );
    }
  },

  async threeDsReturn(req: Request, res: Response) {
    const paymentId = String(req.params.id ?? "");

    try {
      const state = String(req.query.state ?? req.body?.state ?? "");
      const paRes = String(
        req.body?.paRes ??
          req.body?.PaRes ??
          req.body?.PARES ??
          req.query?.paRes ??
          req.query?.PaRes ??
          "",
      ).trim();
      const result = await paymentService.completeGooglePay3ds({
        paymentId,
        state,
        paRes,
        apiBaseUrl: publicApiBaseUrl(req),
      });
      const success = result.status === "paid";

      res.set("Cache-Control", "no-store");
      return res.status(success ? 200 : 400).type("html").send(
        resultHtml(
          paymentId,
          success,
          success
            ? "Poți reveni în aplicație. Comanda a fost creată."
            : "Banca nu a confirmat tranzacția.",
        ),
      );
    } catch (error) {
      const failure = errorResponse(error);
      return res.status(failure.status).type("html").send(
        resultHtml(paymentId, false, failure.message),
      );
    }
  },

  async notify(_req: Request, res: Response) {
    // Rezultatul inițial și verificarea 3-D Secure sunt confirmate server-to-server.
    // Endpoint-ul există pentru cerința notifyUrl a API-ului NETOPIA v2. Nu schimbăm
    // starea comenzii dintr-un payload nesemnat.
    return res.status(200).json({ success: true });
  },
};
