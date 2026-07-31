"use client";

import { useEffect, useRef, useState } from "react";

import { socket } from "../../lib/socket";
import { chatService } from "../../services/chat.service";

import { Conversation, Message } from "../../types/chat";

import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";

interface ChatWindowProps {
    conversation: Conversation;
}

export default function ChatWindow({
    conversation,
}: ChatWindowProps) {
    const conversationId = conversation._id;
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log("Registering socket listeners");
        loadMessages();
    }, [conversationId]);

    useEffect(() => {
        socket.emit("joinConversation", conversationId);

        const onNewMessage = (message: Message) => {
            console.log("NEW MESSAGE:", message);
            console.log("Current conversation:", conversationId);

            if (message.conversation !== conversationId) {
                console.log("IGNORED");
                return;
            }

            console.log("ADDED");

            setMessages((prev) => [...prev, message]);
        };

        const onTyping = (userId: string) => {
            setTypingUser(userId);
        };

        const onStopTyping = () => {
            setTypingUser(null);
        };

        const onMessagesSeen = () => {
            setMessages((prev) =>
                prev.map((m) => ({
                    ...m,
                }))
            );
        };

        socket.on("newMessage", onNewMessage);
        socket.on("typing", onTyping);
        socket.on("stopTyping", onStopTyping);
        socket.on("messagesSeen", onMessagesSeen);

        return () => {
             console.log("Removing socket listeners");
            socket.emit("leaveConversation", conversationId);

            socket.off("newMessage", onNewMessage);
            socket.off("typing", onTyping);
            socket.off("stopTyping", onStopTyping);
            socket.off("messagesSeen", onMessagesSeen);
        };
    }, [conversationId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages, typingUser]);

    async function loadMessages() {
        try {
            setLoading(true);

            const data =
                await chatService.getMessages(
                    conversationId
                );

            setMessages(data);

            await chatService.markAsSeen(
                conversationId
            );
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

    return (
        <div className="flex h-full flex-col">

            {conversation.listing && (
                <ChatHeader
                    listing={conversation.listing}
                />
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">

                {messages.map((message) => (
                    <MessageBubble
                        key={message._id}
                        message={message}
                    />
                ))}

                {typingUser && (
                    <div className="text-sm text-gray-500 italic">
                        Typing...
                    </div>
                )}

                <div ref={bottomRef} />

            </div>

            <MessageInput
                conversationId={conversationId}
            />

        </div>
    );
}