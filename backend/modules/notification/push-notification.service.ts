import {
    firebaseMessaging,
} from "../../config/firebase.js";

import {
    PushTokenModel,
} from "./push-token.model.js";

export const pushNotificationService = {
    async sendToUser(
        userId: string,
        payload: {
            title: string;
            body: string;
            data?: Record<string, unknown>;
            badge?: number;
        }
    ) {
        try {
            console.log(
                "========== FCM PUSH NOTIFICATION =========="
            );

            console.log(
                "[FCM] User:",
                userId
            );

            const tokens =
                await PushTokenModel.find({
                    user: userId,
                    active: true,
                }).lean();

            console.log(
                "[FCM] Active tokens:",
                tokens.length
            );

            if (!tokens.length) {
                console.log(
                    "[FCM] No active tokens found"
                );

                return [];
            }

            const results = [];

            for (const item of tokens) {
                try {
                    const message = {
                        token: item.token,

                        notification: {
                            title: payload.title,
                            body: payload.body,
                        },

                        data: Object.fromEntries(
                            Object.entries(
                                payload.data ?? {}
                            ).map(
                                ([key, value]) => [
                                    key,
                                    String(value),
                                ]
                            )
                        ),

                        android: {
                            priority: "high" as const,

                            notification: {
                                sound: "default",
                                channelId:
                                    "nexora_notifications",
                            },
                        },

                        apns: {
                            payload: {
                                aps: {
                                    sound: "default",
                                    badge:
                                        payload.badge,
                                },
                            },
                        },
                    };

                    console.log(
                        "[FCM] Sending to:",
                        item.token
                    );

                    const response =
                        await firebaseMessaging.send(
                            message
                        );

                    console.log(
                        "[FCM] Sent:",
                        response
                    );

                    results.push({
                        token: item.token,
                        success: true,
                        messageId: response,
                    });
                } catch (error: any) {
                    console.error(
                        "[FCM] Failed for token:",
                        item.token,
                        error
                    );

                    const errorCode =
                        error?.code;

                    // Tokenul nu mai este valid.
                    if (
                        errorCode ===
                            "messaging/registration-token-not-registered" ||
                        errorCode ===
                            "messaging/invalid-registration-token"
                    ) {
                        await PushTokenModel.updateOne(
                            {
                                token: item.token,
                            },
                            {
                                $set: {
                                    active: false,
                                },
                            }
                        );

                        console.log(
                            "[FCM] Invalid token deactivated:",
                            item.token
                        );
                    }

                    results.push({
                        token: item.token,
                        success: false,
                        error: errorCode ??
                            String(error),
                    });
                }
            }

            console.log(
                "============================================"
            );

            return results;
        } catch (error) {
            console.error(
                "[FCM] Failed to send notification:",
                error
            );

            return [];
        }
    },
};