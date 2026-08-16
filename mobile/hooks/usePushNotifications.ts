import { useEffect } from "react";
import { router } from "expo-router";

import {
    pushNotificationService,
    PushNotificationData,
} from "@/services/pushNotificationService";

import { useAuth } from "@/hooks/useAuth";

export function usePushNotifications() {
    const { user } = useAuth();

    useEffect(() => {
        if (!user) {
            return;
        }

        let mounted = true;

        async function initialize() {
            if (!mounted) {
                return;
            }

            await pushNotificationService.initialize();
        }

        void initialize();

        return () => {
            mounted = false;
        };
    }, [user]);

    useEffect(() => {
        if (!user) {
            return;
        }

        const receivedSubscription =
            pushNotificationService.addNotificationReceivedListener(
                (notification) => {
                    console.log(
                        "Nexora notification received:",
                        notification
                    );
                }
            );

        const responseSubscription =
            pushNotificationService.addNotificationResponseListener(
                (response) => {
                    handleNotificationResponse(
                        response.notification.request
                            .content.data as PushNotificationData
                    );
                }
            );

        return () => {
            receivedSubscription.remove();
            responseSubscription.remove();
        };
    }, [user]);
}

function handleNotificationResponse(
    data: PushNotificationData
) {
    if (data.conversationId) {
        router.push({
            pathname: "/chat/[id]",
            params: {
                id: data.conversationId,
            },
        });

        return;
    }

    if (data.listingId) {
        router.push({
            pathname: "/listing/[id]",
            params: {
                id: data.listingId,
            },
        });

        return;
    }

    switch (data.type) {
        case "message":
        case "chat":
            return;

        case "listing":
        case "favorite":
        case "offer":
        case "listing_offer":
            return;

        default:
            return;
    }
}