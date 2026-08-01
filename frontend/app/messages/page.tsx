"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { socket } from "../lib/socket";
import { CHAT_EVENTS } from "../lib/chat-events";
import ChatLayout from "../components/Chat/ChatLayout";
import RetryState from "../components/Feedback/RetryState";
import ConversationSkeleton from "../components/Skeleton/ConversationSkeleton";
import { Conversation } from "../types/chat";
import { useConversations } from "../hooks/useConversations";

export default function MessagesPage() {
    const queryClient = useQueryClient();
    const {
        data: conversations = [],
        isLoading,
        isError,
        refetch,
    } = useConversations();

    useEffect(() => {
        function onConversationUpdated(
            conversation: Conversation
        ) {
            queryClient.setQueryData<Conversation[]>(
                ["conversations"],
                (old = []) => {
                    const exists = old.find(
                        (item) => item._id === conversation._id
                    );

                    const updated = exists
                        ? old.map((item) =>
                              item._id === conversation._id
                                  ? conversation
                                  : item
                          )
                        : [conversation, ...old];

                    return updated.sort(
                        (a, b) =>
                            new Date(b.updatedAt).getTime() -
                            new Date(a.updatedAt).getTime()
                    );
                }
            );
        }

        socket.on(
            CHAT_EVENTS.CONVERSATION_UPDATED,
            onConversationUpdated
        );

        return () => {
            socket.off(
                CHAT_EVENTS.CONVERSATION_UPDATED,
                onConversationUpdated
            );
        };
    }, [queryClient]);

    if (isLoading) return <ConversationSkeleton />;

    if (isError) {
        return (
            <div className="p-6">
                <RetryState
                    message="Conversațiile nu au putut fi încărcate."
                    onRetry={() => void refetch()}
                />
            </div>
        );
    }

    return (
        <div className="p-6">
            <ChatLayout conversations={conversations} />
        </div>
    );
}
