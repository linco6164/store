import { api } from "../lib/api";
import { Conversation, Message } from "../types/chat";

export const chatService = {
    async startConversation(listingId: string): Promise<Conversation> {
        const { data } = await api.post<{
            success: boolean;
            conversation: Conversation;
        }>("/chat/start", { listingId });

        return data.conversation;
    },

    async getConversations(): Promise<Conversation[]> {
        const { data } = await api.get<{
            success: boolean;
            conversations: Conversation[];
        }>("/chat/conversations");

        return data.conversations;
    },

    async getConversation(
        conversationId: string
    ): Promise<Conversation> {
        const { data } = await api.get<Conversation>(
            `/chat/${conversationId}`
        );

        return data;
    },

    async getMessages(conversationId: string): Promise<Message[]> {
        const { data } = await api.get<{
            success: boolean;
            messages: Message[];
        }>(`/chat/${conversationId}/messages`);

        return data.messages;
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

    async markAsSeen(conversationId: string): Promise<void> {
        await api.patch(`/chat/${conversationId}/seen`);
    }
};