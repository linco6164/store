"use client";

import Link from "next/link";

import { useAuth } from "@/app/hooks/useAuth";
import { useFavorites } from "@/app/hooks/useFavorites";
import { useConversations } from "@/app/hooks/useConversations";

import FavoritesButton from "./FavoritesButton";
import FavoritesDropdown from "./FavoritesDropdown";

import MessagesButton from "./MessagesButton";
import MessagesDropdown from "./MessagesDropdown";

import NotificationsButton from "./NotificationsButton";
import SellButton from "./SellButton";
import UserMenu from "./UserMenu";

import Skeleton from "../ui/Skeleton";

export default function UserActions() {
    const {
        user,
        loading,
    } = useAuth();

    const {
        favorites,
        loading: favoritesLoading,
        reload: reloadFavorites,
    } = useFavorites();

    const {
        data: conversations = [],
    } = useConversations();

    const unreadMessages =
        conversations.reduce(
            (total, conversation) => {
                const unread =
                    conversation.unread ?? {};

                const count =
                    Object.values(unread).reduce(
                        (sum, value) =>
                            sum + Number(value || 0),
                        0
                    );

                return total + count;
            },
            0
        );

    if (loading) {
        return (
            <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-11 rounded-2xl" />

                <Skeleton className="h-11 w-11 rounded-2xl" />

                <Skeleton className="h-11 w-11 rounded-2xl" />

                <Skeleton className="h-11 w-32 rounded-2xl" />

                <Skeleton className="h-11 w-11 rounded-full" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center gap-3">
                <Link
                    href="/login"
                    className="rounded-xl border border-gray-200 px-5 py-2.5 font-medium transition hover:bg-gray-50"
                >
                    Login
                </Link>

                <Link
                    href="/register"
                    className="rounded-xl bg-black px-5 py-2.5 font-medium text-white transition hover:bg-gray-800"
                >
                    Register
                </Link>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">

            {/* Favorites */}

            <FavoritesDropdown
                favorites={favorites}
                loading={favoritesLoading}
                onReload={reloadFavorites}
                trigger={
                    <FavoritesButton
                        count={
                            favorites.length > 0
                                ? favorites.length
                                : undefined
                        }
                    />
                }
            />

            {/* Messages */}

            <MessagesDropdown
                trigger={
                    <MessagesButton
                        count={
                            unreadMessages > 0
                                ? unreadMessages
                                : undefined
                        }
                    />
                }
            />

            {/* Notifications */}

            <NotificationsButton
                count={0}
            />

            {/* Sell */}

            <SellButton />

            {/* Account */}

            <UserMenu user={user} />

        </div>
    );
}