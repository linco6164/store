import cron from "node-cron";
import { notificationService } from "../modules/notification/notification.service.js";

export function startScheduledPromotions() {
    // exemplu: în fiecare zi de vineri la 18:00
    cron.schedule("0 18 * * 5", async () => {
        await notificationService.sendBroadcastNotification({
            title: "Reduceri de weekend! 🎉",
            body: "Descoperă cele mai noi oferte din Nexora Store",
            data: { type: "promotion" },
        });
        console.log("Notificare promoțională trimisă (vineri 18:00)");
    });

    // poți adăuga oricâte job-uri separate, cu alte programări
}