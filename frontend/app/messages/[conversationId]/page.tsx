"use client";

import { use, useEffect, useState } from "react";

import ChatLayout from "../../components/Chat/ChatLayout";
import RetryState from "../../components/Feedback/RetryState";
import ConversationSkeleton from "../../components/Skeleton/ConversationSkeleton";
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
    const [error, setError] = useState(false);
    const [conversation, setConversation] =
        useState<Conversation>();
    const [conversations, setConversations] =
        useState<Conversation[]>([]);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function loadData() {
            try {
                const [currentConversation, allConversations] =
                    await Promise.all([
                        chatService.getConversation(conversationId),
                        chatService.getConversations(),
                    ]);

                if (cancelled) return;

                setConversation(currentConversation);
                setConversations(allConversations);
                setError(false);
            } catch (loadError) {
                console.error(loadError);
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadData();

        return () => {
            cancelled = true;
        };
    }, [conversationId, retryCount]);

    function retry() {
        setLoading(true);
        setError(false);
        setRetryCount((count) => count + 1);
    }

    if (loading) return <ConversationSkeleton />;

    if (error || !conversation) {
        return (
            <div className="p-6">
                <RetryState
                    message="Conversația nu a putut fi încărcată."
                    onRetry={retry}
                />
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
