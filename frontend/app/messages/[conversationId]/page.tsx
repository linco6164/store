"use client";

import { use, useEffect, useState } from "react";

import ChatLayout from "../../components/Chat/ChatLayout";

import { chatService } from "../../services/chat.service";
import { Conversation } from "../../types/chat";

interface Props {
    params: Promise<{
        conversationId: string;
    }>;
}

export default function ConversationPage({
    params,
}: Props) {
    const { conversationId } = use(params);

    const [loading, setLoading] = useState(true);

    const [conversation, setConversation] =
        useState<Conversation>();

    const [conversations, setConversations] =
        useState<Conversation[]>([]);

    useEffect(() => {
        loadData();
    }, [conversationId]);

    async function loadData() {
        try {
            const [
                currentConversation,
                allConversations,
            ] = await Promise.all([
                chatService.getConversation(
                    conversationId
                ),
                chatService.getConversations(),
            ]);

            setConversation(currentConversation);

            setConversations(allConversations);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                Loading...
            </div>
        );
    }

    return (
        <div className="p-6">
            <ChatLayout
                conversations={conversations}
                activeConversation={conversation}
            />
        </div>
    );
}