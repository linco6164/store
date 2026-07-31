"use client";

import { useEffect, useRef, useState } from "react";

import { socket } from "../../lib/socket";
import { chatService } from "../../services/chat.service";

import { Conversation, Message } from "../../types/chat";

import { CHAT_EVENTS } from "@/app/lib/chat-events";

import { toast } from "sonner";

import TypingIndicator from "./TypingIndicator";
import MessageGroup from "./MessageGroup";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";

import { useAuth } from "../../providers/AuthProvider";

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

    const { user } = useAuth();

    const typingParticipant =
        conversation.participants.find(
            (p) => p._id === typingUser
        );

    const [replyMessage, setReplyMessage] =
        useState<Message | null>(null);

    const notification = useRef<
        HTMLAudioElement | null
    >(null);

    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log("Registering socket listeners");
        loadMessages();
    }, [conversationId]);

    useEffect(() => {
        notification.current =
            new Audio("/sounds/notification.mp3");
    }, []);

    useEffect(() => {
        if (
            Notification.permission !==
            "granted"
        ) {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        console.log("Socket connected:", socket.connected);
        socket.emit("joinConversation", conversationId);

        const onNewMessage = (message: Message) => {
            console.log("NEW MESSAGE:", message);
            console.log("Current conversation:", conversationId);

            if (message.conversation !== conversationId) {
                console.log("IGNORED");
                return;
            }

            console.log("ADDED");

            if (message.sender._id !== user?._id) {
                toast.success(
                    `${message.sender.username} ți-a trimis un mesaj`
                );
                notification.current?.play();
            }

            if (
                document.hidden &&
                Notification.permission === "granted"
            ) {
                new Notification(
                    message.sender.username,
                    {
                        body: message.text,
                        icon:
                            message.sender.avatar,
                    }
                );
            }

            setMessages((prev) => [...prev, message]);

            socket.emit(
                CHAT_EVENTS.DELIVER_MESSAGE,
                {
                    conversationId,
                    messageId: message._id,
                }
            );
        };

        const onTyping = (userId: string) => {
            setTypingUser(userId);
        };

        const onStopTyping = () => {
            setTypingUser(null);
        };

        const onDelivered = (
            messageId: string
        ) => {
            setMessages((prev) =>
                prev.map((m) =>
                    m._id === messageId
                        ? {
                            ...m,
                            delivered: true,
                        }
                        : m
                )
            );
        };

        const onMessagesSeen = (
            data: {
                messageId: string;
                userId: string;
            }
        ) => {
            setMessages((prev) =>
                prev.map((m) =>
                    m._id === data.messageId
                        ? {
                            ...m,
                            seen: true,
                        }
                        : m
                )
            );
        };

        socket.on("newMessage", onNewMessage);
        socket.on("typing", onTyping);
        socket.on("stopTyping", onStopTyping);
        socket.on(
            CHAT_EVENTS.MESSAGE_DELIVERED,
            onDelivered
        );
        socket.on("messagesSeen", onMessagesSeen);

        return () => {
            console.log("Removing socket listeners");
            socket.emit("leaveConversation", conversationId);

            socket.off("newMessage", onNewMessage);
            socket.off("typing", onTyping);
            socket.off("stopTyping", onStopTyping);
            socket.off(
                CHAT_EVENTS.MESSAGE_DELIVERED,
                onDelivered
            );
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

            if (data.length > 0) {
                const lastMessage =
                    data[data.length - 1];

                await chatService.markAsSeen(
                    conversationId,
                    lastMessage._id
                );

                socket.emit(
                    CHAT_EVENTS.SEEN,
                    {
                        conversationId,
                        messageId: lastMessage._id,
                    }
                );
            }
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
                    conversation={conversation}
                />
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3">

                <MessageGroup
                    messages={messages}
                    currentUserId={user!._id}
                />

                {typingUser && typingParticipant && (
                    <TypingIndicator
                        username={typingParticipant.username}
                        avatar={typingParticipant.avatar}
                    />
                )}

                <div ref={bottomRef} />

            </div>

            <MessageInput
                conversationId={conversationId}
                replyMessage={replyMessage}
                onCancelReply={() =>
                    setReplyMessage(null)
                }
            />

        </div>
    );
}