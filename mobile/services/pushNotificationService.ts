import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

export interface PushNotificationData {
    type?: string;
    notificationId?: string;
    conversationId?: string;
    listingId?: string;
    [key: string]: unknown;
}

export interface ExpoPushTokenResult {
    token: string;
    deviceType: "android" | "ios";
}

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

class PushNotificationService {
    async requestPermission(): Promise<boolean> {
        if (!Device.isDevice) {
            console.warn(
                "Push notifications require a physical device."
            );

            return false;
        }

        const existing =
            await Notifications.getPermissionsAsync();

        let status = existing.status;

        if (status !== "granted") {
            const requested =
                await Notifications.requestPermissionsAsync();

            status = requested.status;
        }

        return status === "granted";
    }

    async configureAndroidChannel(): Promise<void> {
        if (Platform.OS !== "android") {
            return;
        }

        await Notifications.setNotificationChannelAsync(
            "default",
            {
                name: "Nexora",
                description:
                    "Notificări Nexora Store",
                importance:
                    Notifications.AndroidImportance.MAX,
                vibrationPattern: [
                    0,
                    250,
                    250,
                ],
                sound: "default",
                lockscreenVisibility:
                    Notifications.AndroidNotificationVisibility.PUBLIC,
            }
        );
    }

    async getExpoPushToken(): Promise<string | null> {
        if (!Device.isDevice) {
            console.warn(
                "Expo Push Token cannot be generated on a simulator/emulator."
            );

            return null;
        }

        const hasPermission =
            await this.requestPermission();

        if (!hasPermission) {
            return null;
        }

        const projectId =
            Constants.expoConfig?.extra?.eas
                ?.projectId ??
            Constants.easConfig?.projectId;

        if (!projectId) {
            throw new Error(
                "EAS projectId nu este configurat."
            );
        }

        const token =
            await Notifications.getExpoPushTokenAsync(
                {
                    projectId,
                }
            );

        return token.data;
    }

    async registerDevice(): Promise<
        ExpoPushTokenResult | null
    > {
        if (!Device.isDevice) {
            return null;
        }

        await this.configureAndroidChannel();

        const token =
            await this.getExpoPushToken();

        if (!token) {
            return null;
        }

        return {
            token,
            deviceType:
                Platform.OS === "ios"
                    ? "ios"
                    : "android",
        };
    }

    addNotificationReceivedListener(
        callback: (
            notification: Notifications.Notification
        ) => void
    ) {
        return Notifications.addNotificationReceivedListener(
            callback
        );
    }

    addNotificationResponseListener(
        callback: (
            response: Notifications.NotificationResponse
        ) => void
    ) {
        return Notifications.addNotificationResponseReceivedListener(
            callback
        );
    }

    async getLastNotificationResponse() {
        return Notifications.getLastNotificationResponseAsync();
    }

    async getBadgeCount(): Promise<number> {
        return Notifications.getBadgeCountAsync();
    }

    async setBadgeCount(
        count: number
    ): Promise<void> {
        await Notifications.setBadgeCountAsync(
            count
        );
    }

    async clearBadge(): Promise<void> {
        await this.setBadgeCount(0);
    }
}

export const pushNotificationService =
    new PushNotificationService();