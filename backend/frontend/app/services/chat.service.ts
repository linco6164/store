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
        const { data } = await api.post<{
            success: boolean;
            message: Message;
        }>(
            "/chat/send",
            {
                conversationId,
                text,
                images,
            }
        );

        return data.message;
    },

    async markAsSeen(
        conversationId: string,
        messageId: string
    ): Promise<void> {
        await api.patch(
            `/chat/${conversationId}/seen`,
            {
                messageId,
            }
        );
    },

    async uploadImages(
        files: File[],
        folder = "chat",
        subfolder?: string
    ): Promise<string[]> {
        const formData = new FormData();

        files.forEach((file) =>
            formData.append("images", file)
        );

        formData.append("folder", folder);

        if (subfolder) {
            formData.append(
                "subfolder",
                subfolder
            );
        }

        const { data } = await api.post<{
            success: boolean;
            urls: string[];
        }>(
            "/upload",
            formData,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            }
        );

        return data.urls;
    }

};
