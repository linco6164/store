import axios from "axios";
import * as SecureStore from "@/services/storage";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL;

const TOKEN_KEY =
    "nexora_access_token";

export interface ChatUser {
    _id: string;
    username: string;
    avatar?: string;
}

export interface Message {
    _id: string;
    conversation: string;
    sender: ChatUser;
    text: string;
    images: string[];
    replyTo?: {
        _id: string;
        text: string;
        images: string[];
        sender: ChatUser;
    };
    seenBy: string[];
    deliveredTo: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Conversation {
    _id: string;
    participants: ChatUser[];

    listing?: {
        _id: string;
        title: string;
        images: string[];
        price: number;
    };

    lastMessage?: Message | string;

    lastMessageAt: string;

    unread?: Record<string, number>;

    createdAt: string;
    updatedAt: string;
}

async function getToken() {
    return SecureStore.getItemAsync(
        TOKEN_KEY
    );
}

async function request<T>(
    method:
        | "get"
        | "post"
        | "patch",
    path: string,
    data?: unknown
): Promise<T> {
    if (!API_URL) {
        throw new Error(
            "EXPO_PUBLIC_API_URL nu este configurat."
        );
    }

    const token =
        await getToken();

    const response =
        await axios.request<T>({
            method,
            url: `${API_URL}${path}`,
            data,
            timeout: 30000,
            headers: {
                "Content-Type":
                    "application/json",

                ...(token
                    ? {
                          Authorization:
                              `Bearer ${token}`,
                      }
                    : {}),
            },
        });

    return response.data;
}

interface ConversationsResponse {
    success: boolean;
    conversations: Conversation[];
}

interface ConversationResponse {
    success: boolean;
    conversation: Conversation;
}

interface MessagesResponse {
    success: boolean;
    messages: Message[];
}

interface MessageResponse {
    success: boolean;
    message: Message;
}

export const chatService = {
    /**
     * Creează sau returnează
     * conversația pentru un anunț.
     */
    async startConversation(
        listingId: string
    ): Promise<Conversation> {
        const response =
            await request<ConversationResponse>(
                "post",
                "/chat/start",
                {
                    listingId,
                }
            );

        return response.conversation;
    },

    /**
     * Toate conversațiile
     * utilizatorului autentificat.
     */
    async getConversations(): Promise<
        Conversation[]
    > {
        const response =
            await request<ConversationsResponse>(
                "get",
                "/chat/conversations"
            );

        return response.conversations;
    },

    /**
     * O conversație.
     */
    async getConversation(
        conversationId: string
    ): Promise<Conversation> {
        const response =
            await request<Conversation>(
                "get",
                `/chat/${conversationId}`
            );

        return response;
    },

    /**
     * Mesajele unei conversații.
     */
    async getMessages(
        conversationId: string
    ): Promise<Message[]> {
        const response =
            await request<MessagesResponse>(
                "get",
                `/chat/${conversationId}/messages`
            );

        return response.messages;
    },

    /**
     * Trimite mesaj.
     */
    async sendMessage(
        conversationId: string,
        text: string,
        images: string[] = []
    ): Promise<Message> {
        const response =
            await request<MessageResponse>(
                "post",
                "/chat/send",
                {
                    conversationId,
                    text,
                    images,
                }
            );

        return response.message;
    },

    /**
     * Marchează conversația ca citită.
     */
    async markAsSeen(
        conversationId: string,
        messageId?: string
    ): Promise<void> {
        await request(
            "patch",
            `/chat/${conversationId}/seen`,
            messageId
                ? { messageId }
                : undefined
        );
    },
};