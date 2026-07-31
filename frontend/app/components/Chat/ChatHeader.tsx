"use client";

import Image from "next/image";
import Link from "next/link";
import { MoreVertical, Circle } from "lucide-react";
import { useOnlineUsers } from "@/app/hooks/useOnlineUsers";

import { Conversation } from "../../types/chat";
import { useAuth } from "../../providers/AuthProvider";

import OnlineBadge from "./OnlineBadge";



interface Props {
    conversation: Conversation;
}

export default function ChatHeader({
    conversation,
}: Props) {
    const { user } = useAuth();

    const onlineUsers =
        useOnlineUsers();

    const otherUser = conversation.participants.find(
        (p) => p._id !== user?._id
    );

    if (!otherUser) return null;

    return (
        <header className="flex items-center justify-between border-b bg-white px-6 py-4">

            {/* LEFT */}

            <div className="flex items-center gap-4">

                <div className="relative">

                    <Image
                        src={
                            otherUser.avatar ||
                            "/images/default-avatar.png"
                        }
                        alt={otherUser.username}
                        width={52}
                        height={52}
                        className="rounded-full object-cover"
                    />

                    <Circle
                        size={12}
                        fill="#22c55e"
                        strokeWidth={0}
                        className="absolute bottom-0 right-0"
                    />

                </div>

                <div>

                    <h2 className="text-lg font-semibold">
                        {otherUser.username}
                    </h2>

                    <OnlineBadge
                        online={onlineUsers.includes(
                            otherUser._id
                        )}
                    />

                </div>

            </div>

            {/* CENTER */}

            {conversation.listing && (
                <Link
                    href={`/listing/${conversation.listing._id}`}
                    className="hidden items-center gap-4 rounded-xl border px-4 py-2 transition hover:bg-gray-50 lg:flex"
                >
                    <Image
                        src={
                            conversation.listing.images[0] ||
                            "/images/no-image.png"
                        }
                        alt={conversation.listing.title}
                        width={52}
                        height={52}
                        className="rounded-lg object-cover"
                    />

                    <div>

                        <p className="font-medium">
                            {conversation.listing.title}
                        </p>

                        <p className="text-sm font-semibold text-blue-600">
                            {conversation.listing.price} Lei
                        </p>

                    </div>

                </Link>
            )}

            {/* RIGHT */}

            <div className="flex items-center gap-3">

                {conversation.listing && (
                    <Link
                        href={`/listing/${conversation.listing._id}`}
                        className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
                    >
                        Vezi anunțul
                    </Link>
                )}

                <button className="rounded-lg p-2 transition hover:bg-gray-100">
                    <MoreVertical size={22} />
                </button>

            </div>

        </header>
    );
}