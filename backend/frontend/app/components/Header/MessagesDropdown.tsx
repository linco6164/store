"use client";

import Link from "next/link";
import Image from "next/image";
import {
    MessageCircle,
    RefreshCw,
} from "lucide-react";

import Dropdown from "../ui/Dropdown";
import EmptyState from "../ui/EmptyState";

import { useConversations } from "@/app/hooks/useConversations";

function formatMessageTime(date?: string) {
    if (!date) return "";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "";
    }

    const now = new Date();

    const diff =
        now.getTime() - value.getTime();

    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "acum";

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h`;
    }

    const days = Math.floor(hours / 24);

    if (days < 7) {
        return `${days}z`;
    }

    return value.toLocaleDateString("ro-RO", {
        day: "2-digit",
        month: "2-digit",
    });
}

interface Props {
    trigger: React.ReactNode;
}

export default function MessagesDropdown({
    trigger,
}: Props) {
    const {
        data: conversations = [],
        isLoading,
        isError,
        refetch,
    } = useConversations();

    return (
        <Dropdown
            width="lg"
            trigger={trigger}
        >
            {/* Header */}
            <div className="border-b border-gray-100 px-5 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Mesaje
                        </h3>

                        <p className="mt-0.5 text-xs text-gray-500">
                            Conversațiile tale
                        </p>
                    </div>

                    {isError && (
                        <button
                            type="button"
                            onClick={() => void refetch()}
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                            title="Reîncearcă"
                        >
                            <RefreshCw size={17} />
                        </button>
                    )}
                </div>
            </div>

            {/* Loading */}
            {isLoading && (
                <div className="space-y-3 p-4">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="flex animate-pulse items-center gap-4 rounded-xl p-2"
                        >
                            <div className="h-12 w-12 shrink-0 rounded-full bg-gray-200" />

                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-4 w-32 rounded bg-gray-200" />

                                <div className="h-4 w-48 rounded bg-gray-200" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Error */}
            {!isLoading && isError && (
                <div className="p-6 text-center">
                    <p className="text-sm font-medium text-gray-700">
                        Mesajele nu au putut fi încărcate.
                    </p>

                    <button
                        type="button"
                        onClick={() => void refetch()}
                        className="mt-3 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        Încearcă din nou
                    </button>
                </div>
            )}

            {/* Empty */}
            {!isLoading &&
                !isError &&
                conversations.length === 0 && (
                    <div className="p-6">
                        <EmptyState
                            icon={
                                <MessageCircle size={34} />
                            }
                            title="Nu ai mesaje"
                            description="Conversațiile tale vor apărea aici."
                        />
                    </div>
                )}

            {/* Conversations */}
            {!isLoading &&
                !isError &&
                conversations.length > 0 && (
                    <>
                        <div className="max-h-[420px] overflow-y-auto">
                            {conversations.map(
                                (conversation) => {
                                    /*
                                     * Într-o conversație avem doi participanți.
                                     * Pentru dropdown afișăm participantul care
                                     * nu este utilizatorul curent dacă API-ul
                                     * îl furnizează primul/ultimul.
                                     *
                                     * Pentru moment folosim primul participant,
                                     * deoarece acesta este formatul existent
                                     * în Conversation.
                                     */
                                    const participant =
                                        conversation.participants?.[0];

                                    const image =
                                        participant?.avatar ||
                                        "/images/default-avatar.png";

                                    const unread =
                                        Object.values(
                                            conversation.unread ?? {}
                                        ).some(
                                            (value) =>
                                                Number(value) > 0
                                        );

                                    return (
                                        <Link
                                            key={
                                                conversation._id
                                            }
                                            href={`/messages/${conversation._id}`}
                                            className="group flex items-center gap-3 border-b border-gray-100 px-5 py-4 transition hover:bg-gray-50"
                                        >
                                            <div className="relative shrink-0">
                                                <Image
                                                    src={image}
                                                    alt={
                                                        participant?.username ||
                                                        "User"
                                                    }
                                                    width={48}
                                                    height={48}
                                                    className="rounded-full object-cover"
                                                />

                                                {unread && (
                                                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600" />
                                                )}
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p
                                                        className={
                                                            unread
                                                                ? "truncate font-bold text-gray-900"
                                                                : "truncate font-semibold text-gray-800"
                                                        }
                                                    >
                                                        {participant?.username ||
                                                            "Utilizator"}
                                                    </p>

                                                    <span className="shrink-0 text-xs text-gray-400">
                                                        {formatMessageTime(
                                                            conversation.lastMessageAt
                                                        )}
                                                    </span>
                                                </div>

                                                {conversation.listing && (
                                                    <p className="mt-0.5 truncate text-xs font-medium text-blue-600">
                                                        {
                                                            conversation
                                                                .listing
                                                                .title
                                                        }
                                                    </p>
                                                )}

                                                <p
                                                    className={
                                                        unread
                                                            ? "mt-1 truncate text-sm font-medium text-gray-700"
                                                            : "mt-1 truncate text-sm text-gray-500"
                                                    }
                                                >
                                                    {conversation.lastMessage?.text ||
                                                        "Începe conversația"}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                }
                            )}
                        </div>

                        <div className="border-t border-gray-100 p-3">
                            <Link
                                href="/messages"
                                className="block rounded-xl py-2.5 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                            >
                                Vezi toate conversațiile
                            </Link>
                        </div>
                    </>
                )}
        </Dropdown>
    );
}