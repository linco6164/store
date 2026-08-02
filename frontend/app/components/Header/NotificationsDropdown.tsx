"use client";

import Link from "next/link";
import {
    Bell,
    Package,
    Heart,
    MessageCircle,
    UserPlus,
} from "lucide-react";

import Dropdown from "../ui/Dropdown";
import HeaderIconButton from "./HeaderIconButton";
import EmptyState from "../ui/EmptyState";

interface NotificationItem {
    id: string;
    title: string;
    description: string;
    time: string;
    unread: boolean;
    type:
        | "listing"
        | "favorite"
        | "message"
        | "follow";
}

interface Props {
    notifications?: NotificationItem[];
}

function NotificationIcon({
    type,
}: {
    type: NotificationItem["type"];
}) {
    switch (type) {
        case "listing":
            return (
                <Package
                    size={18}
                    className="text-blue-600"
                />
            );

        case "favorite":
            return (
                <Heart
                    size={18}
                    className="text-red-500"
                />
            );

        case "message":
            return (
                <MessageCircle
                    size={18}
                    className="text-emerald-600"
                />
            );

        case "follow":
            return (
                <UserPlus
                    size={18}
                    className="text-violet-600"
                />
            );

        default:
            return (
                <Bell
                    size={18}
                    className="text-gray-500"
                />
            );
    }
}

export default function NotificationsDropdown({
    notifications = [],
}: Props) {
    const unread =
        notifications.filter(
            (n) => n.unread
        ).length;

    return (
        <Dropdown
            width="lg"
            trigger={
                <HeaderIconButton
                    icon={<Bell size={21} />}
                    tooltip="Notificări"
                    count={unread}
                />
            }
        >
            <div className="border-b px-5 py-4">
                <h3 className="text-lg font-semibold">
                    Notificări
                </h3>
            </div>

            {notifications.length === 0 ? (
                <div className="p-6">
                    <EmptyState
                        icon={<Bell size={34} />}
                        title="Nu ai notificări"
                        description="Când se întâmplă ceva important, vei vedea aici."
                    />
                </div>
            ) : (
                <>
                    <div className="max-h-[420px] overflow-y-auto">
                        {notifications.map(
                            (notification) => (
                                <Link
                                    key={
                                        notification.id
                                    }
                                    href="/notifications"
                                    className="flex gap-4 border-b px-5 py-4 transition hover:bg-gray-50"
                                >
                                    <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                                        <NotificationIcon
                                            type={
                                                notification.type
                                            }
                                        />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">
                                                {
                                                    notification.title
                                                }
                                            </p>

                                            <span className="text-xs text-gray-400">
                                                {
                                                    notification.time
                                                }
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {
                                                notification.description
                                            }
                                        </p>
                                    </div>

                                    {notification.unread && (
                                        <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-600" />
                                    )}
                                </Link>
                            )
                        )}
                    </div>

                    <div className="border-t p-3">
                        <Link
                            href="/notifications"
                            className="block rounded-xl py-2 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                            Vezi toate notificările
                        </Link>
                    </div>
                </>
            )}
        </Dropdown>
    );
}