"use client";

import { useEffect, useState } from "react";
import { socket } from "../lib/socket";

import ChatLayout from "../components/Chat/ChatLayout";

import { chatService } from "../services/chat.service";
import { Conversation, Message } from "../types/chat";
import { CHAT_EVENTS } from "../lib/chat-events";

export default function MessagesPage() {
    const [conversations, setConversations] = useState<
        Conversation[]
    >([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConversations();
    }, []);

    useEffect(() => {
        function onConversationUpdated(
            conversation: Conversation
        ) {
            setConversations((prev) => {
                const exists = prev.find(
                    (c) =>
                        c._id === conversation._id
                );

                let updated: Conversation[];

                if (exists) {
                    updated = prev.map((c) =>
                        c._id === conversation._id
                            ? conversation
                            : c
                    );
                } else {
                    updated = [
                        conversation,
                        ...prev,
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
            });
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
    }, []);

    async function loadConversations() {
        try {
            const data =
                await chatService.getConversations();

            setConversations(data);
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
            />
        </div>
    );
}