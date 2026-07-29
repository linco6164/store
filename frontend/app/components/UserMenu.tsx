"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Heart, LogOut, MessageCircle, Settings, User, Package } from "lucide-react";
import type { CurrentUser } from "@/app/hooks/useCurrentUser";
import { useAuth } from "@/app/hooks/useAuth";

interface Props {
    user: CurrentUser;
}

export default function UserMenu({ user }: Props) {
    const [open, setOpen] = useState(false);

    const { logout } = useAuth();

    const menuRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                menuRef.current &&
                !menuRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-3 rounded-lg p-2 hover:bg-gray-100 transition"
            >
                <Image
                    src={
                        user.avatar ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.username
                        )}`
                    }
                    alt={user.username}
                    width={40}
                    height={40}
                    className="rounded-full"
                />

                <div className="hidden text-left md:block">
                    <p className="font-medium">{user.username}</p>
                    <p className="text-xs text-gray-500">
                        {user.email}
                    </p>
                </div>

                <ChevronDown
                    size={18}
                    className={`transition ${open ? "rotate-180" : ""
                        }`}
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-white shadow-xl overflow-hidden z-50">

                    <div className="border-b p-4">
                        <p className="font-semibold">
                            {user.username}
                        </p>

                        <p className="text-sm text-gray-500">
                            {user.email}
                        </p>
                    </div>

                    <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                    >
                        <User size={18} />
                        My Profile
                    </Link>

                    <Link
                        href="/listing"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                    >
                        <Package size={18} />
                        My Listings
                    </Link>

                    <Link
                        href="/favorites"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                    >
                        <Heart size={18} />
                        Favorites
                    </Link>

                    <Link
                        href="/messages"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                    >
                        <MessageCircle size={18} />
                        Messages
                    </Link>

                    <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                    >
                        <Settings size={18} />
                        Settings
                    </Link>

                    <button
                        onClick={() => {
                            logout();
                            setOpen(false);
                        }}
                        className="flex w-full items-center gap-3 border-t px-4 py-3 text-red-600 hover:bg-red-50"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>

                </div>
            )}
        </div>
    );
}