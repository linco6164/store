import { Request, Response } from "express";

import { AuthRequest } from "../../middleware/auth.js";
import { paymentService } from "./payment.service.js";
import { netopiaService } from "./netopia.service.js";
import PaymentModel from "./payment.model.js";

export const paymentController = {
  async createNetopia(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { listingId } = req.body ?? {};

      if (typeof listingId !== "string" || !listingId.trim()) {
        return res.status(400).json({
          success: false,
          message: "listingId este obligatoriu.",
        });
      }

      const result = await paymentService.createNetopiaPayment(
        req.userId,
        listingId.trim(),
      );

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("PAYMENT CREATE ERROR:", error);

      if (error instanceof Error) {
        switch (error.message) {
          case "INVALID_LISTING_ID":
            return res.status(400).json({
              success: false,
              message: "ID produs invalid.",
            });
          case "BUYER_NOT_FOUND":
            return res.status(404).json({
              success: false,
              message: "Cumpărătorul nu a fost găsit.",
            });
          case "LISTING_NOT_AVAILABLE":
            return res.status(404).json({
              success: false,
              message: "Produsul nu mai este disponibil.",
            });
          case "CANNOT_BUY_OWN_LISTING":
            return res.status(400).json({
              success: false,
              message: "Nu poți cumpăra propriul produs.",
            });
          case "INVALID_LISTING_PRICE":
            return res.status(400).json({
              success: false,
              message: "Prețul produsului este invalid.",
            });
          case "UNSUPPORTED_CURRENCY":
            return res.status(400).json({
              success: false,
              message: "Moneda produsului nu este acceptată.",
            });
        }
      }

      return res.status(500).json({
        success: false,
        message: "Nu am putut iniția plata.",
      });
    }
  },

  async checkout(req: Request, res: Response) {
    try {
      const paymentId = String(req.params.id ?? "");

      if (!paymentId) {
        return res.status(400).send("Payment ID invalid.");
      }

      const payment = await PaymentModel.findById(paymentId)
        .populate("buyer", "email fullName username phone city county postalCode country")
        .populate("listing", "title price currency status");

      if (!payment) {
        return res.status(404).send("Plata nu a fost găsită.");
      }

      if (payment.status !== "pending") {
        return res.status(400).send(
          `Plata nu mai poate fi continuată. Status: ${payment.status}`,
        );
      }

      const checkout = await paymentService.getCheckoutData(
        payment,
        payment.buyer,
        payment.listing,
      );

      const fields = checkout.checkout;

      const hidden = [
        ["env_key", fields.env_key],
        ["data", fields.data],
        ["cipher", fields.cipher],
        ["iv", fields.iv],
      ]
        .filter(([, value]) => value)
        .map(
          ([name, value]) =>
            `<input type="hidden" name="${name}" value="${String(value)
              .replace(/&/g, "&amp;")
              .replace(/"/g, "&quot;")}" />`,
        )
        .join("\n");

      const html = `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Plată Nexora Store</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      color: #222;
    }
    .box {
      width: min(92vw, 420px);
      padding: 28px;
      text-align: center;
      background: white;
      border-radius: 18px;
      box-shadow: 0 10px 40px rgba(0,0,0,.08);
    }
    .spinner {
      width: 34px;
      height: 34px;
      margin: 0 auto 18px;
      border: 4px solid #ddd;
      border-top-color: #111;
      border-radius: 50%;
      animation: spin .8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <div class="box">
    <div class="spinner"></div>
    <h2>Se deschide plata...</h2>
    <p>Vei fi redirecționat către NETOPIA pentru plata cu cardul.</p>
  </div>

  <form id="netopia-payment" method="post" action="${checkout.checkout.gatewayUrl}">
    ${hidden}
  </form>

  <script>
    document.getElementById('netopia-payment').submit();
  </script>
</body>
</html>`;

      return res
        .status(200)
        .type("html")
        .send(html);
    } catch (error) {
      console.error("PAYMENT CHECKOUT ERROR:", error);
      return res.status(500).send("Nu am putut deschide plata.");
    }
  },

  async confirm(req: Request, res: Response) {
    let errorType = 0;
    let errorCode = 0;
    let errorMessage = "ok";

    try {
      if (req.method.toUpperCase() !== "POST") {
        errorType = 2;
        errorCode = 1000;
        errorMessage = "Metodă invalidă.";

        return res
          .status(200)
          .type("application/xml")
          .send(
            netopiaService.buildConfirmResponse({
              errorType,
              errorCode,
              message: errorMessage,
            }),
          );
      }

      const { env_key, data, cipher, iv } = req.body ?? {};

      if (
        typeof env_key !== "string" ||
        typeof data !== "string" ||
        !env_key ||
        !data
      ) {
        errorType = 2;
        errorCode = 1001;
        errorMessage = "Parametri NETOPIA invalizi.";

        return res
          .status(200)
          .type("application/xml")
          .send(
            netopiaService.buildConfirmResponse({
              errorType,
              errorCode,
              message: errorMessage,
            }),
          );
      }

      await paymentService.handleNotification({
        envKey: env_key,
        data,
        cipher: typeof cipher === "string" ? cipher : undefined,
        iv: typeof iv === "string" ? iv : undefined,
      });

      return res
        .status(200)
        .type("application/xml")
        .send(
          netopiaService.buildConfirmResponse({
            errorType: 0,
            errorCode: 0,
            message: "ok",
          }),
        );
    } catch (error) {
      console.error("NETOPIA CONFIRM ERROR:", error);

      return res
        .status(200)
        .type("application/xml")
        .send(
          netopiaService.buildConfirmResponse({
            errorType: 1,
            errorCode: 1002,
            message:
              error instanceof Error
                ? error.message
                : "Eroare temporară la procesarea plății.",
          }),
        );
    }
  },

  async returnPage(req: Request, res: Response) {
    try {
      const paymentId = String(req.query.paymentId ?? "");

      let status = "pending";
      let amount = "";
      let currency = "RON";

      if (paymentId) {
        const payment = await PaymentModel.findById(paymentId).select(
          "status amount currency",
        );

        if (payment) {
          status = payment.status;
          amount = payment.amount.toFixed(2);
          currency = payment.currency;
        }
      }

      const success = status === "paid";
      const title = success
        ? "Plată finalizată"
        : status === "pending"
          ? "Plata este în procesare"
          : "Plata nu a fost finalizată";

      return res
        .status(200)
        .type("html")
        .send(`<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #f5f5f5;
      font-family: Arial, sans-serif;
    }
    .box {
      width: min(92vw, 430px);
      padding: 30px;
      text-align: center;
      background: white;
      border-radius: 18px;
      box-shadow: 0 10px 40px rgba(0,0,0,.08);
    }
    .status {
      font-size: 54px;
      margin-bottom: 12px;
    }
  </style>
</head>
<body>
  <div class="box">
    <div class="status">${success ? "✓" : status === "pending" ? "…" : "!"}</div>
    <h1>${title}</h1>
    ${amount ? `<p>${amount} ${currency}</p>` : ""}
    <p>Poți închide această pagină și reveni în Nexora Store.</p>
  </div>
</body>
</html>`);
    } catch (error) {
      console.error("NETOPIA RETURN ERROR:", error);
      return res.status(500).send("Eroare la procesarea revenirii din plată.");
    }
  },

  async getPayment(req: AuthRequest, res: Response) {
    try {
      if (!req.userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const payment = await paymentService.getPayment(
        req.userId,
        String(req.params.id ?? ""),
      );

      return res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      if (error instanceof Error && error.message === "PAYMENT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Plata nu a fost găsită.",
        });
      }

      console.error("GET PAYMENT ERROR:", error);
      return res.status(500).json({
        success: false,
        message: "Nu am putut încărca plata.",
      });
    }
  },
};
