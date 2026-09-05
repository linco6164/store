import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";
import { NexoraThemeProvider } from "@/theme";
import { AuthProvider } from "@/hooks/useAuth";

import UpdateManager from "@/components/UpdateManager";

import * as Updates from "expo-updates";
import * as Notifications from "expo-notifications";

import { NotificationProvider } from "@/context/NotificationContext";

import { useEffect } from "react";

import { router, Stack } from "expo-router";

import {
    pushNotificationService,
    PushNotificationData,
} from "@/services/pushNotificationService";

import { usePushNotifications } from "@/hooks/usePushNotifications";

console.log("========== EAS UPDATE ==========");
console.log("Update ID:", Updates.updateId);
console.log("Runtime Version:", Updates.runtimeVersion);
console.log("Channel:", Updates.channel);
console.log("Is Embedded Launch:", Updates.isEmbeddedLaunch);
console.log("================================");

export const unstable_settings = {
    anchor: "(tabs)",
};

function RootLayoutContent() {
    const colorScheme = useColorScheme();

    // IMPORTANT:
    // This component is rendered INSIDE AuthProvider.
    usePushNotifications();

    useEffect(() => {
        let mounted = true;

        const initializePush = async () => {
            if (!mounted) {
                return;
            }

            try {
                await pushNotificationService.initialize();
            } catch (error) {
                console.error(
                    "Failed to initialize push notifications:",
                    error
                );
            }
        };

        initializePush();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        const handleNotificationResponse = (
            response: Notifications.NotificationResponse
        ) => {
            const data =
                response.notification.request.content
                    .data as PushNotificationData;

            if (data.conversationId) {
                router.push({
                    pathname: "/chat/[id]",
                    params: {
                        id: String(data.conversationId),
                    },
                });

                return;
            }

            if (data.listingId) {
                router.push({
                    pathname: "/listing/[id]",
                    params: {
                        id: String(data.listingId),
                    },
                });

                return;
            }

            if (data.notificationId) {
                router.push("/notifications");
            }
        };

        const subscription =
            pushNotificationService.addNotificationResponseListener(
                handleNotificationResponse
            );

        const checkLastResponse = async () => {
            try {
                const response =
                    await pushNotificationService.getLastNotificationResponse();

                if (response) {
                    handleNotificationResponse(response);
                }
            } catch (error) {
                console.error(
                    "Failed to get last notification response:",
                    error
                );
            }
        };

        checkLastResponse();

        return () => {
            subscription.remove();
        };
    }, []);

    return (
        <NotificationProvider>
            <NexoraThemeProvider>
                <UpdateManager />

                <Stack
                    screenOptions={{
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="(tabs)" />

                    <Stack.Screen name="(auth)/login" />

                    <Stack.Screen name="(auth)/register" />

                    <Stack.Screen name="(auth)/two-factor" />

                    <Stack.Screen
                        name="modal"
                        options={{
                            presentation: "modal",
                        }}
                    />

                    <Stack.Screen name="notifications" />

                    <Stack.Screen name="listing/[id]" />

                    <Stack.Screen name="chat/[id]" />
                </Stack>

                <StatusBar
                    style={
                        colorScheme === "dark"
                            ? "light"
                            : "dark"
                    }
                />
            </NexoraThemeProvider>
        </NotificationProvider>
    );
}

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <AuthProvider>
                <RootLayoutContent />
            </AuthProvider>
        </SafeAreaProvider>
    );
}