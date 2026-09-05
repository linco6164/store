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
        if (Platform.OS === 'web') {
            return null;
        }
        return Notifications.getLastNotificationResponse();
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

    async registerTokenWithBackend(
        token: string,
        deviceType: "android" | "ios"
    ): Promise<void> {
        const API_URL =
            process.env.EXPO_PUBLIC_API_URL;

        if (!API_URL) {
            throw new Error(
                "EXPO_PUBLIC_API_URL nu este configurat."
            );
        }

        const SecureStore =
            await import("expo-secure-store");

        const accessToken =
            await SecureStore.getItemAsync(
                "nexora_access_token"
            );

        if (!accessToken) {
            console.warn(
                "Nu există token de autentificare. Push token-ul nu poate fi înregistrat."
            );
            return;
        }

        const response =
            await fetch(
                `${API_URL}/notifications/push-token`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        token,
                        platform:
                            deviceType,
                    }),
                }
            );
        console.log(
            "Push token backend response:",
            response.status
        );

        if (!response.ok) {
            const message =
                await response.text();

            throw new Error(
                `Failed to register push token: ${response.status} ${message}`
            );
        }
    }

    async initialize(): Promise<
        ExpoPushTokenResult | null
    > {
        try {
            const device =
                await this.registerDevice();

            if (!device) {
                return null;
            }

            await this.registerTokenWithBackend(
                device.token,
                device.deviceType
            );

            console.log(
                "Nexora Push Token registered:",
                device.token
            );

            return device;
        } catch (error) {
            console.error(
                "Failed to initialize push notifications:",
                error
            );
            console.error(
                "Failed to register push token with backend:",
                error
            );

            return null;
        }
    }
}

export const pushNotificationService =
    new PushNotificationService();