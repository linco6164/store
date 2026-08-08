"use client";

import Link from "next/link";
import Image from "next/image";
import {
    Bell,
    Check,
    RefreshCw,
    Trash2,
    Heart,
    MessageCircle,
    ShoppingBag,
    Tag,
    Info,
} from "lucide-react";

import Dropdown from "../ui/Dropdown";
import EmptyState from "../ui/EmptyState";

import { useNotifications } from "@/app/hooks/useNotifications";
import type { Notification } from "@/app/services/notification.service";

interface Props {
    trigger: React.ReactNode;
}

function formatNotificationTime(
    date?: string
) {
    if (!date) return "";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
        return "";
    }

    const now = new Date();

    const diff =
        now.getTime() - value.getTime();

    const minutes = Math.floor(
        diff / 60000
    );

    if (minutes < 1) {
        return "acum";
    }

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(
        minutes / 60
    );

    if (hours < 24) {
        return `${hours}h`;
    }

    const days = Math.floor(
        hours / 24
    );

    if (days < 7) {
        return `${days}z`;
    }

    return value.toLocaleDateString(
        "ro-RO",
        {
            day: "2-digit",
            month: "2-digit",
        }
    );
}

function getNotificationIcon(
    notification: Notification
) {
    switch (notification.type) {
        case "message":
            return (
                <MessageCircle
                    size={17}
                />
            );

        case "favorite":
            return (
                <Heart size={17} />
            );

        case "offer":
            return (
                <Tag size={17} />
            );

        case "sale":
            return (
                <ShoppingBag
                    size={17}
                />
            );

        default:
            return <Info size={17} />;
    }
}

function getNotificationHref(
    notification: Notification
) {
    if (notification.conversation) {
        return `/messages/${notification.conversation}`;
    }

    if (notification.listing?._id) {
        return `/listing/${notification.listing._id}`;
    }

    return null;
}

export default function NotificationsDropdown({
    trigger,
}: Props) {
    const {
        notifications,
        unreadCount,
        loading,
        error,
        reload,
        markAsRead,
        markAllAsRead,
        remove,
    } = useNotifications();

    async function handleNotificationClick(
        notification: Notification
    ) {
        if (!notification.read) {
            await markAsRead(
                notification._id
            );
        }
    }

    return (
        <Dropdown
            width="lg"
            trigger={trigger}
        >
            {/* Header */}

            <div className="border-b border-gray-100 px-5 py-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Notificări
                        </h3>

                        <p className="mt-0.5 text-xs text-gray-500">
                            {unreadCount > 0
                                ? `${unreadCount} necitite`
                                : "Ești la zi"}
                        </p>
                    </div>

                    <div className="flex items-center gap-1">
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={() =>
                                    void markAllAsRead()
                                }
                                className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                                title="Marchează toate ca citite"
                            >
                                <Check
                                    size={17}
                                />
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={() =>
                                void reload()
                            }
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                            title="Reîncarcă"
                        >
                            <RefreshCw
                                size={17}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading */}

            {loading && (
                <div className="space-y-3 p-4">
                    {[1, 2, 3].map(
                        (item) => (
                            <div
                                key={item}
                                className="flex animate-pulse gap-3 rounded-xl p-2"
                            >
                                <div className="h-10 w-10 shrink-0 rounded-full bg-gray-200" />

                                <div className="min-w-0 flex-1 space-y-2">
                                    <div className="h-4 w-3/4 rounded bg-gray-200" />

                                    <div className="h-3 w-full rounded bg-gray-200" />

                                    <div className="h-3 w-16 rounded bg-gray-200" />
                                </div>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* Error */}

            {!loading && error && (
                <div className="p-6 text-center">
                    <p className="text-sm font-medium text-gray-700">
                        Notificările nu au putut fi încărcate.
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            void reload()
                        }
                        className="mt-3 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        Încearcă din nou
                    </button>
                </div>
            )}

            {/* Empty */}

            {!loading &&
                !error &&
                notifications.length === 0 && (
                    <div className="p-6">
                        <EmptyState
                            icon={
                                <Bell size={34} />
                            }
                            title="Nu ai notificări"
                            description="Notificările tale vor apărea aici."
                        />
                    </div>
                )}

            {/* Notifications */}

            {!loading &&
                !error &&
                notifications.length > 0 && (
                    <>
                        <div className="max-h-[430px] overflow-y-auto">
                            {notifications.map(
                                (notification) => {
                                    const href =
                                        getNotificationHref(
                                            notification
                                        );

                                    const content = (
                                        <div
                                            className={`group flex gap-3 border-b border-gray-100 px-5 py-4 transition hover:bg-gray-50 ${
                                                !notification.read
                                                    ? "bg-blue-50/40"
                                                    : ""
                                            }`}
                                        >
                                            {/* Actor / icon */}

                                            <div className="relative shrink-0">
                                                {notification
                                                    .actor
                                                    ?.avatar ? (
                                                    <Image
                                                        src={
                                                            notification
                                                                .actor
                                                                .avatar
                                                        }
                                                        alt={
                                                            notification
                                                                .actor
                                                                .username ||
                                                            "User"
                                                        }
                                                        width={
                                                            42
                                                        }
                                                        height={
                                                            42
                                                        }
                                                        className="h-[42px] w-[42px] rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div
                                                        className={`flex h-[42px] w-[42px] items-center justify-center rounded-full ${
                                                            notification.read
                                                                ? "bg-gray-100 text-gray-500"
                                                                : "bg-blue-100 text-blue-600"
                                                        }`}
                                                    >
                                                        {getNotificationIcon(
                                                            notification
                                                        )}
                                                    </div>
                                                )}

                                                {!notification.read && (
                                                    <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-blue-600" />
                                                )}
                                            </div>

                                            {/* Content */}

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <p
                                                        className={`text-sm ${
                                                            notification.read
                                                                ? "font-semibold text-gray-800"
                                                                : "font-bold text-gray-900"
                                                        }`}
                                                    >
                                                        {
                                                            notification.title
                                                        }
                                                    </p>

                                                    <span className="shrink-0 text-[11px] text-gray-400">
                                                        {formatNotificationTime(
                                                            notification.createdAt
                                                        )}
                                                    </span>
                                                </div>

                                                <p className="mt-1 text-sm leading-5 text-gray-500">
                                                    {
                                                        notification.message
                                                    }
                                                </p>

                                                {notification
                                                    .actor
                                                    ?.username && (
                                                    <p className="mt-1 text-xs font-medium text-gray-400">
                                                        {
                                                            notification
                                                                .actor
                                                                .username
                                                        }
                                                    </p>
                                                )}
                                            </div>

                                            {/* Delete */}

                                            <button
                                                type="button"
                                                onClick={(
                                                    event
                                                ) => {
                                                    event.preventDefault();
                                                    event.stopPropagation();

                                                    void remove(
                                                        notification._id
                                                    );
                                                }}
                                                className="self-center rounded-lg p-1.5 text-gray-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100"
                                                title="Șterge notificarea"
                                            >
                                                <Trash2
                                                    size={
                                                        15
                                                    }
                                                />
                                            </button>
                                        </div>
                                    );

                                    if (!href) {
                                        return (
                                            <button
                                                key={
                                                    notification._id
                                                }
                                                type="button"
                                                onClick={() =>
                                                    void handleNotificationClick(
                                                        notification
                                                    )
                                                }
                                                className="block w-full text-left"
                                            >
                                                {
                                                    content
                                                }
                                            </button>
                                        );
                                    }

                                    return (
                                        <Link
                                            key={
                                                notification._id
                                            }
                                            href={
                                                href
                                            }
                                            onClick={() =>
                                                void handleNotificationClick(
                                                    notification
                                                )
                                            }
                                        >
                                            {
                                                content
                                            }
                                        </Link>
                                    );
                                }
                            )}
                        </div>
                    </>
                )}
        </Dropdown>
    );
}