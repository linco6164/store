"use client";

import Link from "next/link";

import { useAuth } from "@/app/hooks/useAuth";

import FavoritesButton from "./FavoritesButton";
import MessagesButton from "./MessagesButton";
import NotificationsButton from "./NotificationsButton";
import SellButton from "./SellButton";
import UserMenu from "./UserMenu";

import Skeleton from "../ui/Skeleton";

export default function UserActions() {
    const { user, loading } = useAuth();

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

            <FavoritesButton
                count={0}
            />

            <MessagesButton
                count={0}
            />

            <NotificationsButton
                count={0}
            />

            <SellButton />

            <UserMenu
                user={user}
            />

        </div>
    );
}