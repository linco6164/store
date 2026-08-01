"use client";

import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { socket } from "../lib/socket";
import { CHAT_EVENTS } from "../lib/chat-events";

import ChatLayout from "../components/Chat/ChatLayout";
import ConversationSkeleton from "../components/Skeleton/ConversationSkeleton";

import { Conversation } from "../types/chat";
import  { useConversations }  from "../hooks/useConversations";

export default function MessagesPage() {
    const queryClient = useQueryClient();

    const {
        data: conversations = [],
        isLoading,
        isError,
    } = useConversations();

    useEffect(() => {
        function onConversationUpdated(
            conversation: Conversation
        ) {
            queryClient.setQueryData<Conversation[]>(
                ["conversations"],
                (old = []) => {
                    const exists = old.find(
                        (c) =>
                            c._id === conversation._id
                    );

                    let updated: Conversation[];

                    if (exists) {
                        updated = old.map((c) =>
                            c._id === conversation._id
                                ? conversation
                                : c
                        );
                    } else {
                        updated = [
                            conversation,
                            ...old,
                        ];
                    }

                    updated.sort(
                        (a, b) =>
                            new Date(
                                b.updatedAt
                            ).getTime() -
                            new Date(
                                a.updatedAt
                            ).getTime()
                    );

                    return updated;
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

    if (isLoading) {
        return <ConversationSkeleton />;
    }

    if (isError) {
        return (
            <div className="flex h-[calc(100vh-64px)] items-center justify-center">
                A apărut o eroare la încărcarea conversațiilor.
            </div>
        );
    }

    return (
        <div className="p-6">
            <ChatLayout
                conversations={conversations}
            />
        </div>
    );
}