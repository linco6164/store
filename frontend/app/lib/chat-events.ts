export const CHAT_EVENTS = {
    JOIN_CONVERSATION: "joinConversation",
    LEAVE_CONVERSATION: "leaveConversation",

    SEND_MESSAGE: "sendMessage",
    NEW_MESSAGE: "newMessage",

    TYPING: "typing",
    STOP_TYPING: "stopTyping",

    SEEN: "seen",
    MESSAGES_SEEN: "messagesSeen",

    DELIVER_MESSAGE: "deliverMessage",
    MESSAGE_DELIVERED: "messageDelivered",

    USER_ONLINE: "userOnline",
    USER_OFFLINE: "userOffline",
    ONLINE_USERS: "onlineUsers",

    CONVERSATION_UPDATED: "conversationUpdated",
} as const;