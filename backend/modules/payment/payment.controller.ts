import { Request, Response } from "express";

import { AuthRequest } from "../../middleware/auth.js";
import { paymentService } from "./payment.service.js";
import { netopiaService } from "./netopia.service.js";
import PaymentModel from "./payment.model.js";

export const paymentController = {
  // ============================================================
  // CREATE NETOPIA PAYMENT
  // ============================================================

  async createNetopia(
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

      const {
        listingId,
        addressId,
        deliveryMethod,
        paymentMethod,
        savedCardId,
      } = req.body ?? {};

      // --------------------------------------------------------
      // LISTING
      // --------------------------------------------------------

      if (
        typeof listingId !== "string" ||
        !listingId.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "listingId este obligatoriu.",
        });
      }

      // --------------------------------------------------------
      // ADDRESS
      // --------------------------------------------------------

      if (
        typeof addressId !== "string" ||
        !addressId.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "addressId este obligatoriu.",
        });
      }

      // --------------------------------------------------------
      // DELIVERY
      // --------------------------------------------------------

      if (
        deliveryMethod !== "courier" &&
        deliveryMethod !== "pickup_point"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "deliveryMethod trebuie să fie courier sau pickup_point.",
        });
      }

      // --------------------------------------------------------
      // PAYMENT METHOD
      // --------------------------------------------------------

      if (
        paymentMethod !== "card" &&
        paymentMethod !== "google_pay" &&
        paymentMethod !== "apple_pay"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "paymentMethod invalid.",
        });
      }

      // --------------------------------------------------------
      // CARD SALVAT
      // --------------------------------------------------------

      if (
        savedCardId !== undefined &&
        savedCardId !== null &&
        typeof savedCardId !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "savedCardId invalid.",
        });
      }

      const result =
        await paymentService.createNetopiaPayment(
          req.userId,
          listingId.trim(),
          addressId.trim(),
          deliveryMethod,
          paymentMethod,
          savedCardId
            ? savedCardId.trim()
            : null,
        );

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(
        "PAYMENT CREATE ERROR:",
        error,
      );

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

          case "INVALID_SAVED_CARD_ID":
            return res.status(400).json({
              success: false,
              message:
                "ID card salvat invalid.",
            });

          case "BUYER_NOT_FOUND":
            return res.status(404).json({
              success: false,
              message:
                "Cumpărătorul nu a fost găsit.",
            });

          case "LISTING_NOT_AVAILABLE":
            return res.status(404).json({
              success: false,
              message:
                "Produsul nu mai este disponibil.",
            });

          case "ADDRESS_NOT_FOUND":
            return res.status(404).json({
              success: false,
              message:
                "Adresa selectată nu a fost găsită.",
            });

          case "SAVED_CARD_NOT_FOUND":
            return res.status(404).json({
              success: false,
              message:
                "Cardul salvat nu a fost găsit.",
            });

          case "CANNOT_BUY_OWN_LISTING":
            return res.status(400).json({
              success: false,
              message:
                "Nu poți cumpăra propriul produs.",
            });

          case "INVALID_LISTING_PRICE":
            return res.status(400).json({
              success: false,
              message:
                "Prețul produsului este invalid.",
            });

          case "UNSUPPORTED_CURRENCY":
            return res.status(400).json({
              success: false,
              message:
                "Moneda produsului nu este acceptată.",
            });

          case "CHECKOUT_CURRENCY_NOT_SUPPORTED":
            return res.status(400).json({
              success: false,
              message:
                "Checkout-ul este momentan disponibil doar pentru produse în RON.",
            });

          case "INVALID_DELIVERY_METHOD":
            return res.status(400).json({
              success: false,
              message:
                "Metoda de livrare este invalidă.",
            });

          case "INVALID_PAYMENT_METHOD":
            return res.status(400).json({
              success: false,
              message:
                "Metoda de plată este invalidă.",
            });

          case "SAVED_CARD_REQUIRED":
            return res.status(400).json({
              success: false,
              message:
                "Selectează un card salvat.",
            });

          case "SAVED_CARD_NOT_ALLOWED_FOR_PAYMENT_METHOD":
            return res.status(400).json({
              success: false,
              message:
                "Cardul salvat nu poate fi folosit cu această metodă de plată.",
            });

          case "INVALID_PAYMENT_AMOUNT":
            return res.status(400).json({
              success: false,
              message:
                "Suma plății este invalidă.",
            });
        }
      }

      return res.status(500).json({
        success: false,
        message:
          "Nu am putut iniția plata.",
      });
    }
  },

  // ============================================================
  // NETOPIA CHECKOUT PAGE
  // ============================================================

  async checkout(
    req: Request,
    res: Response,
  ) {
    try {
      const paymentId =
        String(
          req.params.id ?? "",
        ).trim();

      if (!paymentId) {
        return res
          .status(400)
          .send("Payment ID invalid.");
      }

      const payment =
        await PaymentModel.findById(
          paymentId,
        )
          .populate(
            "buyer",
            "email fullName username phone city county postalCode country",
          )
          .populate(
            "listing",
            "title price currency status",
          );

      if (!payment) {
        return res
          .status(404)
          .send(
            "Plata nu a fost găsită.",
          );
      }

      if (
        payment.status !== "pending"
      ) {
        return res
          .status(400)
          .send(
            `Plata nu mai poate fi continuată. Status: ${payment.status}`,
          );
      }

      const checkout =
        paymentService.getCheckoutData(
          payment,
          payment.buyer,
          payment.listing,
        );

      const fields =
        checkout.checkout;

      const hidden = [
        ["env_key", fields.env_key],
        ["data", fields.data],
        ["cipher", fields.cipher],
        ["iv", fields.iv],
      ]
        .filter(
          ([, value]) =>
            value !== undefined &&
            value !== null &&
            value !== "",
        )
        .map(
          ([name, value]) =>
            `<input type="hidden" name="${name}" value="${String(
              value,
            )
              .replace(
                /&/g,
                "&amp;",
              )
              .replace(
                /"/g,
                "&quot;",
              )}" />`,
        )
        .join("\n");

      const html = `<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8" />
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1"
  />

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
      box-shadow:
        0 10px 40px rgba(0,0,0,.08);
    }

    .spinner {
      width: 34px;
      height: 34px;
      margin: 0 auto 18px;

      border: 4px solid #ddd;
      border-top-color: #111;

      border-radius: 50%;

      animation:
        spin .8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  </style>
</head>

<body>

  <div class="box">
    <div class="spinner"></div>

    <h2>
      Se deschide plata...
    </h2>

    <p>
      Vei fi redirecționat către
      NETOPIA pentru plata cu cardul.
    </p>
  </div>

  <form
    id="netopia-payment"
    method="post"
    action="${fields.gatewayUrl}"
  >
    ${hidden}
  </form>

  <script>
    document
      .getElementById('netopia-payment')
      .submit();
  </script>

</body>
</html>`;

      return res
        .status(200)
        .type("html")
        .send(html);
    } catch (error) {
      console.error(
        "PAYMENT CHECKOUT ERROR:",
        error,
      );

      return res
        .status(500)
        .send(
          "Nu am putut deschide plata.",
        );
    }
  },

  // ============================================================
  // NETOPIA CONFIRM
  // ============================================================

  async confirm(
    req: Request,
    res: Response,
  ) {
    let errorType = 0;
    let errorCode = 0;
    let errorMessage = "ok";

    try {
      if (
        req.method.toUpperCase() !==
        "POST"
      ) {
        errorType = 2;
        errorCode = 1000;
        errorMessage =
          "Metodă invalidă.";

        return res
          .status(200)
          .type("application/xml")
          .send(
            netopiaService.buildConfirmResponse(
              {
                errorType,
                errorCode,
                message:
                  errorMessage,
              },
            ),
          );
      }

      const {
        env_key,
        data,
        cipher,
        iv,
      } = req.body ?? {};

      if (
        typeof env_key !== "string" ||
        typeof data !== "string" ||
        !env_key ||
        !data
      ) {
        errorType = 2;
        errorCode = 1001;
        errorMessage =
          "Parametri NETOPIA invalizi.";

        return res
          .status(200)
          .type("application/xml")
          .send(
            netopiaService.buildConfirmResponse(
              {
                errorType,
                errorCode,
                message:
                  errorMessage,
              },
            ),
          );
      }

      await paymentService.handleNotification(
        {
          envKey: env_key,
          data,
          cipher:
            typeof cipher ===
            "string"
              ? cipher
              : undefined,
          iv:
            typeof iv === "string"
              ? iv
              : undefined,
        },
      );

      return res
        .status(200)
        .type("application/xml")
        .send(
          netopiaService.buildConfirmResponse(
            {
              errorType: 0,
              errorCode: 0,
              message: "ok",
            },
          ),
        );
    } catch (error) {
      console.error(
        "NETOPIA CONFIRM ERROR:",
        error,
      );

      return res
        .status(200)
        .type("application/xml")
        .send(
          netopiaService.buildConfirmResponse(
            {
              errorType: 1,
              errorCode: 1002,
              message:
                error instanceof Error
                  ? error.message
                  : "Eroare temporară la procesarea plății.",
            },
          ),
        );
    }
  },

  // ============================================================
  // NETOPIA RETURN
  // ============================================================

  async returnPage(
    req: Request,
    res: Response,
  ) {
    try {
      const paymentId =
        String(
          req.query.paymentId ??
            "",
        ).trim();

      let status = "pending";
      let amount = "";
      let currency = "RON";

      if (paymentId) {
        const payment =
          await PaymentModel.findById(
            paymentId,
          ).select(
            "status amount currency",
          );

        if (payment) {
          status =
            payment.status;

          amount =
            payment.amount.toFixed(
              2,
            );

          currency =
            payment.currency;
        }
      }

      let title =
        "Plata este în procesare";

      let message =
        "Așteptăm confirmarea NETOPIA.";

      if (status === "paid") {
        title =
          "Plata a fost efectuată";

        message =
          "Comanda ta a fost înregistrată cu succes.";
      }

      if (
        status === "failed"
      ) {
        title =
          "Plata a eșuat";

        message =
          "Plata nu a putut fi finalizată.";
      }

      if (
        status === "cancelled"
      ) {
        title =
          "Plata a fost anulată";

        message =
          "Plata a fost anulată.";
      }

      if (
        status === "conflict"
      ) {
        title =
          "Plata necesită verificare";

        message =
          "Suma confirmată nu corespunde comenzii.";
      }

      return res
        .status(200)
        .type("html")
        .send(`<!doctype html>
<html lang="ro">
<head>
  <meta charset="utf-8" />

  <meta
    name="viewport"
    content="width=device-width,initial-scale=1"
  />

  <title>Nexora Store</title>

  <style>
    body {
      margin: 0;
      min-height: 100vh;

      display: grid;
      place-items: center;

      font-family:
        Arial,
        sans-serif;

      background:
        #f5f5f5;

      color:
        #111;
    }

    .card {
      width:
        min(92vw, 460px);

      padding:
        32px;

      background:
        #fff;

      border-radius:
        22px;

      text-align:
        center;

      box-shadow:
        0 15px 50px
        rgba(0,0,0,.08);
    }

    .amount {
      margin-top:
        18px;

      font-size:
        28px;

      font-weight:
        800;
    }

    .status {
      margin-top:
        8px;

      color:
        #666;
    }
  </style>
</head>

<body>

  <div class="card">

    <h1>
      ${title}
    </h1>

    <p>
      ${message}
    </p>

    ${
      amount
        ? `
          <div class="amount">
            ${amount} ${currency}
          </div>
        `
        : ""
    }

    <div class="status">
      Status: ${status}
    </div>

  </div>

</body>
</html>`);
    } catch (error) {
      console.error(
        "PAYMENT RETURN ERROR:",
        error,
      );

      return res
        .status(500)
        .send(
          "Nu am putut verifica plata.",
        );
    }
  },

  // ============================================================
  // GET PAYMENT
  // ============================================================

  async getPayment(
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

      const paymentId =
        String(
          req.params.id ?? "",
        ).trim();

      if (!paymentId) {
        return res.status(400).json({
          success: false,
          message:
            "Payment ID invalid.",
        });
      }

      const payment =
        await paymentService.getPayment(
          req.userId,
          paymentId,
        );

      return res.json({
        success: true,
        data: payment,
      });
    } catch (error) {
      console.error(
        "GET PAYMENT ERROR:",
        error,
      );

      if (
        error instanceof Error &&
        error.message ===
          "PAYMENT_NOT_FOUND"
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Plata nu a fost găsită.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          "Nu am putut încărca plata.",
      });
    }
  },
};