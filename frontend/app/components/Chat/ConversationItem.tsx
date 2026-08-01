"use client";

import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

import { Conversation } from "../../types/chat";
import OnlineBadge from "./OnlineBadge";
import { useOnlineUsers } from "../../hooks/useOnlineUsers";

import { useQueryClient } from "@tanstack/react-query";
import { chatService } from "../../services/chat.service";

interface Props {
    conversation: Conversation;
    currentUserId: string;
    active?: boolean;
}

export default function ConversationItem({
    conversation,
    currentUserId,
    active = false,
}: Props) {
    const onlineUsers = useOnlineUsers();

    const otherUser = conversation.participants.find(
        (p) => p._id !== currentUserId
    );

    if (!otherUser) return null;

    const online = onlineUsers.includes(
        otherUser._id
    );

    const unread =
        conversation.unread?.[
        currentUserId
        ] ?? 0;

    const queryClient = useQueryClient();

    async function prefetchConversation() {
        await queryClient.prefetchQuery({
            queryKey: ["conversation", conversation._id],
            queryFn: () =>
                chatService.getConversation(
                    conversation._id
                ),
        });

        await queryClient.prefetchQuery({
            queryKey: [
                "messages",
                conversation._id,
            ],
            queryFn: () =>
                chatService.getMessages(
                    conversation._id
                ),
        });
    }

    return (
        <Link
            href={`/messages/${conversation._id}`}
            onMouseEnter={prefetchConversation}
            onFocus={prefetchConversation}
            className={clsx(
                "flex items-center gap-3 rounded-xl p-3 transition",
                active
                    ? "bg-blue-50"
                    : "hover:bg-gray-100"
            )}
        >
            <div className="relative flex-shrink-0">

                <Image
                    src={
                        otherUser.avatar ||
                        "/images/default-avatar.png"
                    }
                    alt={otherUser.username}
                    width={54}
                    height={54}
                    className="rounded-full object-cover"
                />

                <div className="absolute bottom-0 right-0">
                    <OnlineBadge
                        online={online}
                        size="sm"
                    />
                </div>

            </div>

            <div className="min-w-0 flex-1">

                <div className="flex items-center justify-between">

                    <h3
                        className={clsx(
                            "truncate font-semibold",
                            unread > 0 &&
                            "text-black"
                        )}
                    >
                        {otherUser.username}
                    </h3>

                    <span className="text-xs text-gray-500">
                        {conversation.lastMessageAt
                            ? new Date(
                                conversation.lastMessageAt
                            ).toLocaleTimeString(
                                "ro-RO",
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )
                            : ""}
                    </span>

                </div>

                <div className="mt-1 flex items-center justify-between">

                    <p
                        className={clsx(
                            "truncate text-sm",
                            unread > 0
                                ? "font-medium text-gray-900"
                                : "text-gray-500"
                        )}
                    >
                        {conversation.lastMessage?.text ??
                            "Începe conversația"}
                    </p>

                    {unread > 0 && (
                        <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
                            {unread > 99
                                ? "99+"
                                : unread}
                        </span>
                    )}

                </div>

            </div>
        </Link>
    );
}