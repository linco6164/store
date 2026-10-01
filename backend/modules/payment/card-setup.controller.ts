import { Request, Response } from "express";

import { AuthRequest } from "../../middleware/auth.js";
import { cardSetupService } from "./card-setup.service.js";
import { netopiaService } from "./netopia.service.js";

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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function checkoutHtml(
  gatewayUrl: string,
  fields: {
    env_key: string;
    data: string;
    cipher: string;
    iv: string;
  },
) {
  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Nexora - Adăugare card</title>
  <style>
    body { margin: 0; min-height: 100vh; display: grid; place-items: center;
      background: #f7f7f8; font-family: Arial, sans-serif; color: #171717; }
    main { text-align: center; padding: 32px; }
    .loader { width: 42px; height: 42px; margin: 0 auto 20px;
      border: 4px solid #e5e5e5; border-top-color: #50c878;
      border-radius: 50%; animation: spin .8s linear infinite; }
    h1 { margin: 0 0 8px; font-size: 22px; }
    p { margin: 0; color: #666; line-height: 1.45; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <main>
    <div class="loader"></div>
    <h1>Se deschide pagina securizată</h1>
    <p>Datele cardului vor fi introduse direct la NETOPIA Payments.</p>
  </main>
  <form id="netopia-form" method="POST" action="${escapeHtml(gatewayUrl)}">
    <input type="hidden" name="env_key" value="${escapeHtml(fields.env_key)}" />
    <input type="hidden" name="data" value="${escapeHtml(fields.data)}" />
    <input type="hidden" name="cipher" value="${escapeHtml(fields.cipher)}" />
    <input type="hidden" name="iv" value="${escapeHtml(fields.iv)}" />
  </form>
  <script>document.getElementById("netopia-form").submit();</script>
</body>
</html>`;
}

function errorStatus(error: unknown): number {
  const message = error instanceof Error ? error.message : "";

  if (message === "USER_NOT_FOUND" || message === "CARD_SETUP_NOT_FOUND") {
    return 404;
  }

  if (
    message === "CARD_SETUP_RETURN_URL_INVALID" ||
    message === "CARD_SETUP_ALREADY_FINISHED"
  ) {
    return 400;
  }

  return 500;
}

export const cardSetupController = {
  async create(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const platform = req.body?.platform;
      const returnUrl = req.body?.returnUrl;

      if (platform !== "android" && platform !== "web") {
        return res.status(400).json({
          success: false,
          message: "Platforma este invalidă.",
        });
      }

      if (typeof returnUrl !== "string" || !returnUrl.trim()) {
        return res.status(400).json({
          success: false,
          message: "returnUrl este obligatoriu.",
        });
      }

      const setup = await cardSetupService.createSetup({
        userId: req.userId,
        platform,
        returnUrl,
        requestOrigin:
          typeof req.headers.origin === "string"
            ? req.headers.origin
            : undefined,
      });
      const apiBaseUrl = publicApiBaseUrl(req);

      return res.status(201).json({
        success: true,
        data: {
          setupId: setup._id.toString(),
          checkoutUrl:
            `${apiBaseUrl}/payments/cards/setup/checkout/` +
            encodeURIComponent(setup._id.toString()),
        },
      });
    } catch (error) {
      console.error("CARD SETUP CREATE ERROR:", error);

      return res.status(errorStatus(error)).json({
        success: false,
        message:
          error instanceof Error &&
          error.message === "CARD_SETUP_RETURN_URL_INVALID"
            ? "Adresa de revenire nu este permisă."
            : "Nu am putut iniția adăugarea cardului.",
      });
    }
  },

  async checkout(req: Request, res: Response) {
    try {
      const setupId = String(req.params.id ?? "");
      const fields = await cardSetupService.getCheckout(
        setupId,
        publicApiBaseUrl(req),
      );
      const gatewayUrl = String(fields.gatewayUrl ?? "").trim();

      if (!gatewayUrl) {
        throw new Error("NETOPIA_GATEWAY_MISSING");
      }

      res.set("Cache-Control", "no-store");
      return res.status(200).type("html").send(checkoutHtml(gatewayUrl, fields));
    } catch (error) {
      console.error("CARD SETUP CHECKOUT ERROR:", error);
      return res
        .status(errorStatus(error))
        .type("text")
        .send("Nu am putut deschide verificarea cardului.");
    }
  },

  async confirm(req: Request, res: Response) {
    try {
      const body = req.body ?? {};
      const envKey = String(body.env_key ?? body.envKey ?? "");
      const data = String(body.data ?? "");
      const cipher = body.cipher ? String(body.cipher) : undefined;
      const iv = body.iv ? String(body.iv) : undefined;

      if (!envKey || !data) {
        throw new Error("NETOPIA_NOTIFICATION_INCOMPLETE");
      }

      await cardSetupService.handleNotification({ envKey, data, cipher, iv });

      return res.status(200).type("application/xml").send(
        netopiaService.buildConfirmResponse({
          errorType: 0,
          errorCode: 0,
          message: "OK",
        }),
      );
    } catch (error) {
      console.error("CARD SETUP CONFIRM ERROR:", error);

      return res.status(200).type("application/xml").send(
        netopiaService.buildConfirmResponse({
          errorType: 1,
          errorCode: 1,
          message: error instanceof Error ? error.message : "Setup error",
        }),
      );
    }
  },

  async returnPage(req: Request, res: Response) {
    try {
      const setup = await cardSetupService.getSetup(
        String(req.query.setupId ?? ""),
      );
      const redirectUrl = new URL(setup.returnUrl);

      redirectUrl.searchParams.set(
        "cardSetup",
        setup.status === "completed" ? "success" : setup.status,
      );

      const safeRedirect = JSON.stringify(redirectUrl.toString()).replace(
        /</g,
        "\\u003c",
      );

      res.set("Cache-Control", "no-store");
      return res.status(200).type("html").send(`<!DOCTYPE html>
<html lang="ro"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Nexora</title></head><body>
<script>window.location.replace(${safeRedirect});</script>
<p>Poți reveni în aplicația Nexora.</p>
</body></html>`);
    } catch (error) {
      console.error("CARD SETUP RETURN ERROR:", error);
      return res.status(404).send("Sesiunea de verificare nu a fost găsită.");
    }
  },
};
