import { PushTokenModel } from "./push-token.model";

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
        const tokens =
            await PushTokenModel.find({
                user: userId,
                active: true,
            }).lean();

        if (!tokens.length) {
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

        const response =
            await fetch(EXPO_PUSH_URL, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Accept-encoding":
                        "gzip, deflate",
                    "Content-Type":
                        "application/json",
                },
                body: JSON.stringify(
                    messages
                ),
            });

        if (!response.ok) {
            const text =
                await response.text();

            throw new Error(
                `Expo Push API error ${response.status}: ${text}`
            );
        }

        const result =
            (await response.json()) as ExpoPushResponse;

        await this.processTickets(
            tokens,
            result.data
        );

        return result.data;
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
                    ticket.status ===
                        "error" &&
                    ticket.details
                        ?.error ===
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