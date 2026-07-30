export const CHAT_EVENTS = {
    JOIN: "join",
    JOIN_CONVERSATION: "joinConversation",
    LEAVE_CONVERSATION: "leaveConversation",

    SEND_MESSAGE: "sendMessage",
    NEW_MESSAGE: "newMessage",

    TYPING: "typing",
    STOP_TYPING: "stopTyping",

    SEEN: "seen",
    MESSAGES_SEEN: "messagesSeen",

    USER_ONLINE: "userOnline",
    USER_OFFLINE: "userOffline",
} as const;

export type ChatEvent =
    (typeof CHAT_EVENTS)[keyof typeof CHAT_EVENTS];