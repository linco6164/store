import { PushTokenModel } from "./push-token.model.js";

interface ExpoPushMessage {
    to: string;
    title: string;
    body: string;
    data?: Record<string, unknown>;
    sound?: "default" | null;
    badge?: number;
}

interface ExpoPushTicket {
    status: "ok" | "error";
    id?: string;
    message?: string;
    details?: {
        error?: string;
    };
}

interface ExpoPushResponse {
    data: ExpoPushTicket[];
}

const EXPO_PUSH_URL =
    "https://exp.host/--/api/v2/push/send";

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
                "========== PUSH NOTIFICATION =========="
            );

            console.log(
                "[Push] User:",
                userId
            );

            const tokens =
                await PushTokenModel.find({
                    user: userId,
                    active: true,
                }).lean();

            console.log(
                "[Push] Active tokens:",
                tokens.length
            );

            if (!tokens.length) {
                console.log(
                    "[Push] No active tokens found"
                );

                console.log(
                    "======================================="
                );

                return [];
            }

            const messages: ExpoPushMessage[] =
                tokens.map((item) => ({
                    to: item.token,
                    title: payload.title,
                    body: payload.body,
                    data: payload.data,
                    sound: "default",
                    badge: payload.badge,
                }));

            console.log(
                "[Push] Tokens:",
                tokens.map(
                    (item) => item.token
                )
            );

            console.log(
                "[Push] Sending to Expo..."
            );

            const response =
                await fetch(
                    EXPO_PUSH_URL,
                    {
                        method: "POST",
                        headers: {
                            Accept:
                                "application/json",
                            "Accept-Encoding":
                                "gzip, deflate",
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify(
                            messages
                        ),
                    }
                );

            console.log(
                "[Push] Expo status:",
                response.status
            );

            const responseText =
                await response.text();

            console.log(
                "[Push] Expo raw response:",
                responseText
            );

            if (!response.ok) {
                throw new Error(
                    `Expo Push API error ${response.status}: ${responseText}`
                );
            }

            const result =
                JSON.parse(
                    responseText
                ) as ExpoPushResponse;

            console.log(
                "[Push] Expo response:",
                result.data
            );

            await this.processTickets(
                tokens,
                result.data
            );

            console.log(
                "======================================="
            );

            return result.data;
        } catch (error) {
            console.error(
                "[Push] Failed to send push notification:",
                error
            );

            console.log(
                "======================================="
            );

            return [];
        }
    },

    async processTickets(
        tokens: Array<{
            token: string;
        }>,
        tickets: ExpoPushTicket[]
    ) {
        const invalidTokens: string[] = [];

        tickets.forEach(
            (ticket, index) => {
                if (
                    ticket.status === "error" &&
                    ticket.details?.error ===
                        "DeviceNotRegistered"
                ) {
                    const token =
                        tokens[index]?.token;

                    if (token) {
                        invalidTokens.push(
                            token
                        );
                    }
                }
            }
        );

        if (
            invalidTokens.length > 0
        ) {
            console.log(
                "[Push] Deactivating invalid tokens:",
                invalidTokens
            );

            await PushTokenModel.updateMany(
                {
                    token: {
                        $in: invalidTokens,
                    },
                },
                {
                    $set: {
                        active: false,
                    },
                }
            );
        }
    },
};