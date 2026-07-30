"use client";

import { use, useEffect, useState } from "react";

import ChatWindow from "../../components/Chat/ChatWindow";

import { Conversation } from "../../types/chat";
import { chatService } from "../../services/chat.service";

interface Props {
    params: Promise<{
        conversationId: string;
    }>;
}

export default function ConversationPage({
    params,
}: Props) {
    const { conversationId } = use(params);

    const [conversation, setConversation] =
        useState<Conversation | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConversation();
    }, [conversationId]);

    async function loadConversation() {
        try {
            const data =
                await chatService.getConversation(
                    conversationId
                );

            setConversation(data);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="flex h-full items-center justify-center">
                Conversation not found.
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-64px)]">
            <ChatWindow conversation={conversation} />
        </div>
    );
}