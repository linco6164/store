"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Conversation } from "../../types/chat";
import { useAuth } from "../../providers/AuthProvider";

import ConversationItem from "./ConversationItem";

interface Props {
    conversations: Conversation[];
    activeConversationId?: string;
}

export default function ConversationList({
    conversations,
    activeConversationId,
}: Props) {
    const { user } = useAuth();

    const [search, setSearch] = useState("");

    const filteredConversations = useMemo(() => {
        if (!user) return [];

        return conversations
            .filter((conversation) => {
                const otherUser =
                    conversation.participants.find(
                        (p) => p._id !== user._id
                    );

                if (!otherUser) return false;

                return otherUser.username
                    .toLowerCase()
                    .includes(search.toLowerCase());
            })
            .sort((a, b) => {
                return (
                    new Date(
                        b.lastMessageAt ??
                            b.updatedAt
                    ).getTime() -
                    new Date(
                        a.lastMessageAt ??
                            a.updatedAt
                    ).getTime()
                );
            });
    }, [conversations, search, user]);

    if (!user) return null;

    return (
        <aside className="flex h-full w-full flex-col border-r bg-white">

            {/* Header */}

            <div className="border-b p-5">

                <h2 className="text-xl font-bold">
                    Mesaje
                </h2>

                <div className="relative mt-4">

                    <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        placeholder="Caută conversații..."
                        className="w-full rounded-xl border bg-gray-50 py-2 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:bg-white"
                    />

                </div>

            </div>

            {/* Lista conversațiilor */}

            <div className="flex-1 overflow-y-auto">

                {filteredConversations.length === 0 ? (
                    <div className="flex h-full items-center justify-center p-8 text-center text-sm text-gray-500">
                        Nu există conversații.
                    </div>
                ) : (
                    filteredConversations.map(
                        (conversation) => (
                            <ConversationItem
                                key={
                                    conversation._id
                                }
                                conversation={
                                    conversation
                                }
                                currentUserId={
                                    user._id
                                }
                                active={
                                    conversation._id ===
                                    activeConversationId
                                }
                            />
                        )
                    )
                )}

            </div>

        </aside>
    );
}