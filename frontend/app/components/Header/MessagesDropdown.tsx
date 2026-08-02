"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";

import Dropdown from "../ui/Dropdown";
import HeaderIconButton from "./HeaderIconButton";
import EmptyState from "../ui/EmptyState";

interface MessagePreview {
    id: string;
    username: string;
    avatar: string;
    text: string;
    time: string;
    unread: boolean;
}

interface Props {
    messages?: MessagePreview[];
}

export default function MessagesDropdown({
    messages = [],
}: Props) {
    return (
        <Dropdown
            width="lg"
            trigger={
                <HeaderIconButton
                    icon={<MessageCircle size={21} />}
                    tooltip="Mesaje"
                    count={
                        messages.filter(
                            (m) => m.unread
                        ).length
                    }
                />
            }
        >
            <div className="border-b px-5 py-4">
                <h3 className="text-lg font-semibold">
                    Mesaje
                </h3>
            </div>

            {messages.length === 0 ? (
                <div className="p-6">
                    <EmptyState
                        icon={
                            <MessageCircle size={34} />
                        }
                        title="Nu ai mesaje"
                        description="Conversațiile tale vor apărea aici."
                    />
                </div>
            ) : (
                <>
                    <div className="max-h-[420px] overflow-y-auto">
                        {messages.map((message) => (
                            <Link
                                key={message.id}
                                href={`/messages/${message.id}`}
                                className="flex items-center gap-3 border-b px-5 py-4 transition hover:bg-gray-50"
                            >
                                <Image
                                    src={message.avatar}
                                    alt={message.username}
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                />

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="truncate font-semibold">
                                            {message.username}
                                        </p>

                                        <span className="text-xs text-gray-400">
                                            {message.time}
                                        </span>
                                    </div>

                                    <p className="truncate text-sm text-gray-500">
                                        {message.text}
                                    </p>
                                </div>

                                {message.unread && (
                                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className="border-t p-3">
                        <Link
                            href="/messages"
                            className="block rounded-xl py-2 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                            Vezi toate conversațiile
                        </Link>
                    </div>
                </>
            )}
        </Dropdown>
    );
}