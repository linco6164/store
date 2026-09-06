import { firebaseMessaging } from "../../config/firebase.js";

import { PushTokenModel } from "./push-token.model.js";

export const pushNotificationService = {
  async sendToUser(
    userId: string,
    payload: {
      title: string;
      body: string;
      data?: Record<string, unknown>;
      badge?: number;
      sound?: boolean;
      vibration?: boolean;
    },
  ) {
    try {
      console.log("========== FCM PUSH NOTIFICATION ==========");

      console.log("[FCM] User:", userId);

      const tokens = await PushTokenModel.find({
        user: userId,
        active: true,
      }).lean();

      console.log("[FCM] Active tokens:", tokens.length);

      if (!tokens.length) {
        console.log("[FCM] No active tokens found");

        return [];
      }

      const results = [];

      for (const item of tokens) {
        try {
          /*
           * Convert all FCM data values
           * to strings.
           */
          const data = {
            ...Object.fromEntries(
              Object.entries(payload.data ?? {}).map(([key, value]) => [
                key,
                String(value),
              ]),
            ),

            /*
             * Flutter can use these values
             * for local notification handling.
             */
            sound: String(payload.sound !== false),

            vibration: String(payload.vibration !== false),
          };

          const message = {
            token: item.token,

            notification: {
              title: payload.title,

              body: payload.body,
            },

            data,

            android: {
              priority: "high" as const,

              notification: {
                /*
                 * Android will use the
                 * Nexora notification channel.
                 */
                channelId: "nexora_notifications",

                /*
                 * Default system notification
                 * sound.
                 */
                sound: payload.sound === false ? undefined : "default",

                /*
                 * Default vibration.
                 *
                 * The actual vibration behavior
                 * is controlled by the Android
                 * notification channel.
                 */
                vibrateTimingsMillis:
                  payload.vibration === false ? [0] : [0, 300, 200, 300],
              },
            },

            apns: {
              payload: {
                aps: {
                  sound: payload.sound === false ? undefined : "default",

                  badge: payload.badge,
                },
              },
            },
          };

          console.log("[FCM] Sending to:", item.token);

          console.log("[FCM] Sound:", payload.sound !== false);

          console.log("[FCM] Vibration:", payload.vibration !== false);

          const response = await firebaseMessaging.send(message);

          console.log("[FCM] Sent:", response);

          results.push({
            token: item.token,

            success: true,

            messageId: response,
          });
        } catch (error: any) {
          console.error("[FCM] Failed for token:", item.token, error);

          const errorCode = error?.code;

          /*
           * Tokenul nu mai este valid.
           */
          if (
            errorCode === "messaging/registration-token-not-registered" ||
            errorCode === "messaging/invalid-registration-token"
          ) {
            await PushTokenModel.updateOne(
              {
                token: item.token,
              },

              {
                $set: {
                  active: false,
                },
              },
            );

            console.log("[FCM] Invalid token deactivated:", item.token);
          }

          results.push({
            token: item.token,

            success: false,

            error: errorCode ?? String(error),
          });
        }
      }

      console.log("============================================");

      return results;
    } catch (error) {
      console.error("[FCM] Failed to send notification:", error);

      return [];
    }
  },
  async sendBroadcast(payload: {
    title: string;
    body: string;
    data?: Record<string, unknown>;
  }) {
    try {
      console.log("========== FCM BROADCAST NOTIFICATION ==========");

      const tokens = await PushTokenModel.find({ active: true }).lean();

      console.log("[FCM Broadcast] Active tokens:", tokens.length);

      if (!tokens.length) {
        console.log("[FCM Broadcast] No active tokens found");
        return [];
      }

      const results = [];

      for (const item of tokens) {
        try {
          const data = {
            ...Object.fromEntries(
              Object.entries(payload.data ?? {}).map(([key, value]) => [
                key,
                String(value),
              ]),
            ),
            sound: "true",
            vibration: "true",
          };

          const message = {
            token: item.token,
            notification: {
              title: payload.title,
              body: payload.body,
            },
            data,
            android: {
              priority: "high" as const,
              notification: {
                channelId: "nexora_notifications",
                sound: "default",
                vibrateTimingsMillis: [0, 300, 200, 300],
              },
            },
            apns: {
              payload: {
                aps: {
                  sound: "default",
                },
              },
            },
          };

          const response = await firebaseMessaging.send(message);

          console.log("[FCM Broadcast] Sent to:", item.token);

          results.push({
            token: item.token,
            success: true,
            messageId: response,
          });
        } catch (error: any) {
          console.error("[FCM Broadcast] Failed for token:", item.token, error);

          const errorCode = error?.code;

          if (
            errorCode === "messaging/registration-token-not-registered" ||
            errorCode === "messaging/invalid-registration-token"
          ) {
            await PushTokenModel.updateOne(
              { token: item.token },
              { $set: { active: false } },
            );
            console.log(
              "[FCM Broadcast] Invalid token deactivated:",
              item.token,
            );
          }

          results.push({
            token: item.token,
            success: false,
            error: errorCode ?? String(error),
          });
        }
      }

      console.log(
        "[FCM Broadcast] Total sent:",
        results.filter((r) => r.success).length,
        "/",
        results.length,
      );
      console.log("==================================================");

      return results;
    } catch (error) {
      console.error("[FCM Broadcast] Failed:", error);
      return [];
    }
  },
};
