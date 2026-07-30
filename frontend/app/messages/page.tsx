"use client";

import { useEffect, useState } from "react";

import { chatService } from "../services/chat.service";
import { Conversation } from "../types/chat";

import ConversationList from "../components/Chat/ConversationList";
import EmptyChat from "../components/Chat/EmptyChat";

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConversations();
    }, []);

    async function loadConversations() {
        try {
            const data =
                await chatService.getConversations();

            setConversations(data);
        } catch (error) {
            console.error(error);
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

    if (conversations.length === 0) {
        return <EmptyChat />;
    }

    return (
        <div className="h-[calc(100vh-64px)]">
            <ConversationList
                conversations={conversations}
            />
        </div>
    );
}