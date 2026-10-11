import cron from "node-cron";

import OrderModel from "../modules/order/order.model.js";

import { completeOrder } from "../modules/order/order.service.js";

// ============================================================
// STATE
// ============================================================

let isProcessing = false;

// ============================================================
// PROCESS EXPIRED ORDERS
// ============================================================

async function processExpiredOrders() {
  if (isProcessing) {
    console.log("[Orders] Auto-complete already running.");

    return;
  }

  isProcessing = true;

  try {
    const now = new Date();

    // ========================================================
    // FIND DELIVERED ORDERS
    //
    // Luăm maximum 100 la o rulare.
    // Dacă sunt mai multe, următoarea rulare le continuă.
    // ========================================================

    const orders = await OrderModel.find({
      status: "delivered",

      autoCompleteAt: {
        $ne: null,
        $lte: now,
      },
    })
      .select("_id autoCompleteAt")
      .sort({
        autoCompleteAt: 1,
      })
      .limit(100)
      .lean();

    if (orders.length === 0) {
      return;
    }

    console.log(`[Orders] ${orders.length} orders ready for auto-complete.`);

    // ========================================================
    // COMPLETE ORDERS
    // ========================================================

    for (const order of orders) {
      try {
        await completeOrder(order._id.toString(), "auto_completed");

        console.log(`[Orders] Auto-completed order ${order._id.toString()}.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);

        const orderId = order._id.toString();

        // ======================================================
        // NON-RETRYABLE FINANCIAL ERROR
        //
        // Dacă tranzacția vânzătorului nu mai poate fi
        // eliberată, nu încercăm din nou la fiecare 5 minute.
        // Comanda rămâne delivered pentru verificare manuală.
        // ======================================================

        if (
          message === "SALE_TRANSACTION_NOT_RELEASABLE" ||
          message === "SALE_TRANSACTION_NOT_FOUND"
        ) {
          await OrderModel.updateOne(
            {
              _id: order._id,
              status: "delivered",
            },
            {
              $set: {
                autoCompleteAt: null,
              },
            },
          );

          console.error(
            `[Orders] Auto-complete disabled for order ${orderId} because seller funds cannot be released: ${message}`,
          );

          continue;
        }

        // ======================================================
        // RETRYABLE / UNKNOWN ERROR
        // ======================================================

        console.error(`[Orders] Failed to auto-complete ${orderId}:`, error);
      }
    }
  } catch (error) {
    console.error("[Orders] Auto-complete job failed:", error);
  } finally {
    isProcessing = false;
  }
}

// ============================================================
// START SCHEDULER
// ============================================================

export function startOrderAutoCompleteScheduler() {
  if (process.env.ORDER_AUTO_COMPLETE_ENABLED === "false") {
    console.log("[Orders] Auto-complete scheduler disabled.");

    return;
  }

  /**
   * Verificăm la fiecare 5 minute.
   *
   * Nu trebuie să fie exact la secundă după 48h.
   * O comandă va fi finalizată în maximum câteva minute
   * după expirarea perioadei.
   */
  cron.schedule("*/5 * * * *", async () => {
    await processExpiredOrders();
  });

  /**
   * Verificăm și la pornirea backend-ului.
   *
   * Astfel, dacă serverul a fost oprit când au expirat
   * cele 48h, comenzile sunt recuperate la restart.
   */
  void processExpiredOrders();

  console.log("[Orders] Auto-complete scheduler started.");
}
