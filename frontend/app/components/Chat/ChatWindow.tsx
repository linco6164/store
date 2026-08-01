"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

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
    const [loadError, setLoadError] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);

    const { user } = useAuth();
    const shouldReduceMotion = useReducedMotion();

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
            setLoadError(false);

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
        } catch (error) {
            console.error("Unable to load messages", error);
            setLoadError(true);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-full flex-col">

            {conversation.listing && (
                <ChatHeader
                    conversation={conversation}
                />
            )}

            <div
                aria-busy={loading}
                className="flex-1 overflow-y-auto p-4"
            >
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            key="loading"
                            initial={shouldReduceMotion ? false : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            aria-label="Se încarcă mesajele"
                            className="space-y-5 pt-2"
                        >
                            {["start", "end", "start", "end", "start"].map(
                                (position, index) => (
                                    <div
                                        key={`${position}-${index}`}
                                        className={`flex ${
                                            position === "end"
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >
                                        <div
                                            className={`h-14 animate-pulse rounded-2xl bg-gray-200/80 ${
                                                index % 2 === 0
                                                    ? "w-56"
                                                    : "w-40"
                                            }`}
                                        />
                                    </div>
                                )
                            )}
                        </motion.div>
                    ) : loadError ? (
                        <motion.div
                            key="error"
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
                            transition={{ duration: 0.18 }}
                            className="flex h-full flex-col items-center justify-center gap-3 text-center"
                        >
                            <p className="text-sm text-gray-500">
                                Mesajele nu au putut fi încărcate.
                            </p>
                            <button
                                type="button"
                                onClick={loadMessages}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Reîncearcă
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="messages"
                            initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="space-y-3"
                        >
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
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <MessageInput
                conversationId={conversationId}
                replyMessage={replyMessage}
                disabled={loading || loadError}
                onCancelReply={() =>
                    setReplyMessage(null)
                }
            />

        </div>
    );
}
