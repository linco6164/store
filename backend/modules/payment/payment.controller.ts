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

      const {
        listingId,
        addressId,
        deliveryMethod,
        paymentMethod,
        savedCardId,
      } = req.body ?? {};

      if (typeof listingId !== "string" || !listingId.trim()) {
        return res.status(400).json({
          success: false,
          message: "listingId este obligatoriu.",
        });
      }

      if (typeof addressId !== "string" || !addressId.trim()) {
        return res.status(400).json({
          success: false,
          message: "addressId este obligatoriu.",
        });
      }

      if (deliveryMethod !== "courier" && deliveryMethod !== "pickup_point") {
        return res.status(400).json({
          success: false,
          message: "Metoda de livrare este invalidă.",
        });
      }

      if (
        paymentMethod !== "card" &&
        paymentMethod !== "google_pay" &&
        paymentMethod !== "apple_pay"
      ) {
        return res.status(400).json({
          success: false,
          message: "Metoda de plată este invalidă.",
        });
      }

      if (
        paymentMethod === "card" &&
        (typeof savedCardId !== "string" || !savedCardId.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: "Selectează un card salvat.",
        });
      }

      const result = await paymentService.createNetopiaPayment(
        req.userId,
        listingId.trim(),
        addressId.trim(),
        deliveryMethod,
        paymentMethod,
        typeof savedCardId === "string" ? savedCardId.trim() : undefined,
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

          case "INVALID_ADDRESS_ID":
            return res.status(400).json({
              success: false,
              message: "ID adresă invalid.",
            });

          case "INVALID_DELIVERY_METHOD":
            return res.status(400).json({
              success: false,
              message: "Metoda de livrare este invalidă.",
            });

          case "INVALID_PAYMENT_METHOD":
            return res.status(400).json({
              success: false,
              message: "Metoda de plată este invalidă.",
            });

          case "SAVED_CARD_REQUIRED":
            return res.status(400).json({
              success: false,
              message: "Selectează un card salvat.",
            });

          case "SAVED_CARD_NOT_FOUND":
            return res.status(404).json({
              success: false,
              message: "Cardul selectat nu a fost găsit.",
            });

          case "BUYER_NOT_FOUND":
            return res.status(404).json({
              success: false,
              message: "Cumpărătorul nu a fost găsit.",
            });

          case "ADDRESS_NOT_FOUND":
            return res.status(404).json({
              success: false,
              message: "Adresa selectată nu a fost găsită.",
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

          case "Lipsește NETOPIA_CONFIRM_URL.":
            return res.status(500).json({
              success: false,
              message: "Configurația NETOPIA_CONFIRM_URL lipsește.",
            });

          case "Lipsește NETOPIA_RETURN_URL.":
            return res.status(500).json({
              success: false,
              message: "Configurația NETOPIA_RETURN_URL lipsește.",
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
        .populate(
          "buyer",
          "email fullName username phone city county postalCode country",
        )
        .populate("listing", "title price currency status");

      if (!payment) {
        return res.status(404).send("Plata nu a fost găsită.");
      }

      if (payment.status !== "pending") {
        return res
          .status(400)
          .send(`Plata nu mai poate fi continuată. Status: ${payment.status}`);
      }

      const checkout = await paymentService.getCheckoutData(
        payment,
        payment.buyer,
        payment.listing,
      );

      const fields = checkout.checkout;

      const gatewayUrl = String(fields.gatewayUrl ?? "").trim();

      if (!gatewayUrl) {
        return res.status(500).send("Gateway-ul NETOPIA nu este configurat.");
      }

      const hiddenFields = `
  <input
    type="hidden"
    name="env_key"
    value="${escapeHtml(fields.env_key)}"
  />

  <input
    type="hidden"
    name="data"
    value="${escapeHtml(fields.data)}"
  />

  <input
    type="hidden"
    name="cipher"
    value="${escapeHtml(fields.cipher)}"
  />

  <input
    type="hidden"
    name="iv"
    value="${escapeHtml(fields.iv)}"
  />
`;

      const html = `
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />
  <title>Nexora Store - Plată</title>

  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f7f7f8;
      font-family:
        Arial,
        Helvetica,
        sans-serif;
      color: #171717;
    }

    .container {
      text-align: center;
      padding: 32px;
    }

    .loader {
      width: 42px;
      height: 42px;
      margin: 0 auto 20px;
      border: 4px solid #e5e5e5;
      border-top-color: #111;
      border-radius: 50%;
      animation:
        spin 0.8s linear infinite;
    }

    h1 {
      margin: 0 0 8px;
      font-size: 22px;
    }

    p {
      margin: 0;
      color: #666;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  </style>
</head>

<body>
  <div class="container">
    <div class="loader"></div>

    <h1>Se deschide plata...</h1>

    <p>
      Vei fi redirecționat către
      procesatorul de plăți.
    </p>
  </div>

  <form
    id="netopia-form"
    method="POST"
    action="${escapeHtml(gatewayUrl)}"
  >
    ${hiddenFields}
  </form>

  <script>
    document
      .getElementById("netopia-form")
      .submit();
  </script>
</body>
</html>
      `;

      return res.status(200).type("html").send(html);
    } catch (error) {
      console.error("NETOPIA CHECKOUT ERROR:", error);

      return res.status(500).send("Nu am putut deschide plata.");
    }
  },

  async confirm(req: Request, res: Response) {
    try {
      const body = req.body ?? {};

      const envKey = String(body.env_key ?? body.envKey ?? "");

      const data = String(body.data ?? "");

      const cipher =
        body.cipher !== undefined ? String(body.cipher) : undefined;

      const iv = body.iv !== undefined ? String(body.iv) : undefined;

      if (!envKey || !data) {
        return res
          .status(400)
          .type("application/xml")
          .send(
            netopiaService.buildConfirmResponse({
              errorType: 1,
              errorCode: 400,
              message: "Date NETOPIA incomplete.",
            }),
          );
      }

      const result = await paymentService.handleNotification({
        envKey,
        data,
        cipher,
        iv,
      });

      return res
        .status(200)
        .type("application/xml")
        .send(
          netopiaService.buildConfirmResponse({
            errorType: 0,
            errorCode: 0,
            message: result.paymentStatus === "paid" ? "OK" : "PENDING",
          }),
        );
    } catch (error) {
      console.error("NETOPIA CONFIRM ERROR:", error);

      const message =
        error instanceof Error ? error.message : "Eroare necunoscută.";

      return res
        .status(200)
        .type("application/xml")
        .send(
          netopiaService.buildConfirmResponse({
            errorType: 1,
            errorCode: 1,
            message,
          }),
        );
    }
  },

  async returnPage(req: Request, res: Response) {
    const paymentId = String(req.query.paymentId ?? "");

    if (!paymentId) {
      return res.status(400).send("Lipsește paymentId.");
    }

    return res.status(200).type("html").send(`
<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1"
  />
  <title>Nexora Store</title>
</head>

<body>
  <script>
    window.location.href =
      "nexora://payment-return?paymentId=${encodeURIComponent(paymentId)}";
  </script>

  <p>
    Plata a fost procesată.
    Poți reveni în aplicația Nexora Store.
  </p>
</body>
</html>
      `);
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
        req.params.id as string,
      );

      return res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      console.error("GET PAYMENT ERROR:", error);

      if (error instanceof Error && error.message === "PAYMENT_NOT_FOUND") {
        return res.status(404).json({
          success: false,
          message: "Plata nu a fost găsită.",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Nu am putut încărca plata.",
      });
    }
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
