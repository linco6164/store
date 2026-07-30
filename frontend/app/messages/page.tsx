import { api } from "../lib/api";
import { Conversation, Message } from "../types/chat";

export const chatService = {
    async startConversation(listingId: string): Promise<Conversation> {
        const { data } = await api.post<Conversation>(
            "/chat/start",
            { listingId }
        );

        return data;
    },

    // LISTA tuturor conversațiilor
    async getConversations(): Promise<Conversation[]> {
        const { data } = await api.get<Conversation[]>(
            "/chat/conversations"
        );

        return data;
    },

    // O singură conversație
    async getConversation(
        conversationId: string
    ): Promise<Conversation> {
        const { data } = await api.get<Conversation>(
            `/chat/${conversationId}`
        );

        return data;
    },

    async getMessages(
        conversationId: string
    ): Promise<Message[]> {
        const { data } = await api.get<Message[]>(
            `/chat/${conversationId}/messages`
        );

        return data;
    },

    async sendMessage(
        conversationId: string,
        text: string,
        images: string[] = []
    ): Promise<Message> {
        const { data } = await api.post<Message>(
            "/chat/send",
            {
                conversationId,
                text,
                images,
            }
        );

        return data;
    },

    async markAsSeen(
        conversationId: string
    ): Promise<void> {
        await api.patch(
            `/chat/${conversationId}/seen`
        );
    },
};