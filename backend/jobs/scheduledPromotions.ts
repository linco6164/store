import cron from "node-cron";

import {
  NotificationCampaign,
} from "../modules/notification/notification-campaign.model.js";

import {
  notificationService,
} from "../modules/notification/notification.service.js";


let isProcessing = false;


async function processScheduledNotifications() {
  if (isProcessing) {
    return;
  }

  isProcessing = true;

  try {
    const now = new Date();

    /*
     * Procesăm maximum 20 notificări
     * într-un ciclu.
     */
    for (
      let index = 0;
      index < 20;
      index += 1
    ) {
      /*
       * Luăm atomic următoarea notificare
       * programată care trebuie trimisă.
       */
      const campaign =
        await NotificationCampaign.findOneAndUpdate(
          {
            status: "scheduled",

            scheduledAt: {
              $ne: null,
              $lte: now,
            },

            $or: [
              {
                expiresAt: null,
              },
              {
                expiresAt: {
                  $gt: now,
                },
              },
            ],
          },

          {
            $set: {
              status: "processing",
            },
          },

          {
            sort: {
              scheduledAt: 1,
            },

            new: true,
          },
        );

      /*
       * Nu mai există nimic de trimis.
       */
      if (!campaign) {
        break;
      }

      try {
        console.log(
          `[Notifications] Sending ${campaign._id}`,
        );

        await notificationService
          .sendBroadcastNotification({
            title: campaign.title,

            body: campaign.body,

            data: {
              type:
                campaign.data?.type ??
                "promotion",

              ...(campaign.data?.route
                ? {
                    route:
                      campaign.data.route,
                  }
                : {}),

              ...(campaign.data?.targetId
                ? {
                    targetId:
                      campaign.data.targetId,
                  }
                : {}),

              ...(campaign.data?.url
                ? {
                    url:
                      campaign.data.url,
                  }
                : {}),
            },
          });

        campaign.status = "sent";

        campaign.sentAt =
          new Date();

        await campaign.save();

        console.log(
          `[Notifications] Sent ${campaign._id}`,
        );
      } catch (error) {
        console.error(
          `[Notifications] Failed ${campaign._id}`,
          error,
        );

        campaign.status = "failed";

        await campaign.save();
      }
    }
  } catch (error) {
    console.error(
      "[Notifications] Scheduler error:",
      error,
    );
  } finally {
    isProcessing = false;
  }
}


export function startScheduledPromotions() {
  /*
   * Verificăm notificările programate
   * în fiecare minut.
   */
  cron.schedule("* * * * *", async () => {
    await processScheduledNotifications();
  });

  /*
   * Verificăm și imediat când
   * pornește backend-ul.
   */
  void processScheduledNotifications();

  console.log(
    "[Notifications] Scheduler started",
  );
}