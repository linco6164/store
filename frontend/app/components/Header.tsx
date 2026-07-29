"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "../hooks/useAuth";
import UserMenu from "./UserMenu";
import SearchBar from "./SearchBar";
import { Heart, MessageCircle, Bell } from "lucide-react";
import MessagesDropdown from "../components/Header/MessagesDropdown";
import FavoritesDropdown from "../components/Header/FavoritesDropdown";
import NotificationsDropdown from "../components/Header/NotificationsDropdown";

export default function Header() {
    const { user, loading } = useAuth();

    return (
        <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white px-6">

            <Link
                href="/"
                className="flex items-center gap-3"
            >
                <Image
                    src="/nexora2.png"
                    alt="Nexora Store"
                    width={90}
                    height={80}
                    priority
                />
            </Link>
            <div className="flex flex-1 justify-center px-8">
                <SearchBar />
            </div>

            {/* Dreapta */}
            {!loading && (
                <>
                    {user ? (
                        <div className="flex items-center gap-2">

                            <FavoritesDropdown />

                            <MessagesDropdown />

                            <NotificationsDropdown />

                            <Link
                                href="/sell"
                                className="ml-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                            >
                                Sell now
                            </Link>

                            <UserMenu user={user} />

                        </div>
                    ) : (
                        <div className="flex items-center gap-3">

                            <Link
                                href="/login"
                                className="rounded-lg border border-gray-300 px-5 py-2 text-sm font-medium transition hover:bg-gray-100"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
                            >
                                Register
                            </Link>

                        </div>
                    )}
                </>
            )}

        </header>
    );
}