"use client";

import Image from "next/image";
import Link from "next/link";

import { Conversation } from "../../types/chat";

interface ConversationListProps {
    conversations: Conversation[];
    activeConversationId?: string;
}

export default function ConversationList({
    conversations,
    activeConversationId,
}: ConversationListProps) {
    if (conversations.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-gray-500">
                No conversations yet.
            </div>
        );
    }

    return (
        <div className="divide-y">
            {conversations.map((conversation) => {
                const image =
                    conversation.listing?.images?.[0] ??
                    "/images/placeholder.png";

                return (
                    <Link
                        key={conversation._id}
                        href={`/messages/${conversation._id}`}
                    >
                        <div
                            className={`flex cursor-pointer items-center gap-3 p-4 transition hover:bg-gray-50 ${
                                activeConversationId === conversation._id
                                    ? "bg-gray-100"
                                    : ""
                            }`}
                        >
                            <Image
                                src={image}
                                alt={conversation.listing?.title ?? "Listing"}
                                width={60}
                                height={60}
                                className="h-14 w-14 rounded-lg object-cover"
                            />

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="truncate font-semibold">
                                        {conversation.listing?.title ??
                                            "Conversation"}
                                    </h3>

                                    <span className="text-xs text-gray-400">
                                        {new Date(
                                            conversation.lastMessageAt
                                        ).toLocaleDateString()}
                                    </span>
                                </div>

                                <p className="truncate text-sm text-gray-500">
                                    {conversation.lastMessage?.text ??
                                        "No messages"}
                                </p>
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}