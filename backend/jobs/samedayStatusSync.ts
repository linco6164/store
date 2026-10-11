import cron from "node-cron";

import {
  samedayShipmentService,
} from "../modules/sameday/sameday-shipment.service.js";

// ============================================================
// STATE
// ============================================================

let isProcessing =
  false;

// ============================================================
// SYNC RANGE
// ============================================================

async function syncRecentSamedayStatuses(
  minutes = 15,
) {
  if (isProcessing) {
    console.log(
      "[Sameday] Status sync already running.",
    );

    return;
  }

  isProcessing =
    true;

  try {
    const endDate =
      new Date();

    const startDate =
      new Date(
        endDate.getTime() -
          minutes *
            60 *
            1000,
      );

    console.log(
      `[Sameday] Sync ${startDate.toISOString()} -> ${endDate.toISOString()}`,
    );

    const result =
      await samedayShipmentService
        .syncStatuses(
          startDate.toISOString(),
          endDate.toISOString(),
        );

    console.log(
      "[Sameday] Status sync completed:",
      result,
    );
  } catch (error) {
    console.error(
      "[Sameday] Status sync failed:",
      error,
    );
  } finally {
    isProcessing =
      false;
  }
}

// ============================================================
// START SCHEDULER
// ============================================================

export function startSamedayStatusSync() {
  if (
    process.env
      .SAMEDAY_STATUS_SYNC_ENABLED ===
    "false"
  ) {
    console.log(
      "[Sameday] Status sync disabled.",
    );

    return;
  }

  /**
   * Rulează la fiecare 5 minute.
   *
   * Citim ultimele 15 minute intenționat,
   * astfel încât să avem overlap dacă:
   *
   * - un request a eșuat temporar
   * - Sameday livrează un eveniment puțin mai târziu
   *
   * trackingEvents elimină duplicatele.
   */
  cron.schedule(
    "*/5 * * * *",
    async () => {
      await syncRecentSamedayStatuses(
        15,
      );
    },
  );

  /**
   * La pornirea backend-ului verificăm
   * ultimele 2 ore.
   *
   * Este limita maximă permisă
   * de status-sync Sameday.
   */
  void syncRecentSamedayStatuses(
    120,
  );

  console.log(
    "[Sameday] Status scheduler started.",
  );
}