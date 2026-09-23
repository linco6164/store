import { expirePromotions } from "./promotion.service.js";

const PROMOTION_CHECK_INTERVAL = 60 * 60 * 1000; // 1 oră

export function startPromotionScheduler() {
  const run = async () => {
    try {
      const expiredCount = await expirePromotions();

      if (expiredCount > 0) {
        console.log(
          `[PROMOTION] ${expiredCount} promovări expirate.`,
        );
      }
    } catch (error) {
      console.error(
        "[PROMOTION] Eroare la expirarea promovărilor:",
        error,
      );
    }
  };

  // Verificare imediat la pornirea serverului.
  void run();

  // Verificare periodică.
  setInterval(() => {
    void run();
  }, PROMOTION_CHECK_INTERVAL);

  console.log(
    "[PROMOTION] Scheduler pornit. Verificare la fiecare oră.",
  );
}