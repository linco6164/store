"use client";

import Image from "next/image";
import Link from "next/link";

import {
    User as UserIcon,
    Package,
    Heart,
    Settings,
    LogOut,
    ChevronDown,
    MessageCircle,
    Bell,
    Plus,
} from "lucide-react";

import type { CurrentUser } from "@/app/hooks/useCurrentUser";

import Dropdown from "../ui/Dropdown";
import DropdownItem from "../ui/DropdownItem";

import { useAuth } from "@/app/hooks/useAuth";

interface Props {
    user: CurrentUser;
}

export default function UserMenu({
    user,
}: Props) {
    const { logout } = useAuth();

    async function handleLogout() {
        await logout();
    }

    const avatar =
        user.avatar ||
        "/images/default-avatar.png";

    return (
        <Dropdown
            width="md"
            trigger={
                <button
                    type="button"
                    aria-label="Open account menu"
                    className="group flex items-center gap-2 rounded-2xl p-1.5 transition-all duration-200 hover:bg-gray-100"
                >
                    <div className="relative">
                        <Image
                            src={avatar}
                            alt={user.username}
                            width={42}
                            height={42}
                            className="h-10 w-10 rounded-full object-cover ring-2 ring-white transition group-hover:ring-gray-200"
                        />

                        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                    </div>

                    <div className="hidden min-w-0 text-left lg:block">
                        <p className="max-w-32 truncate text-sm font-semibold text-gray-900">
                            {user.username}
                        </p>

                        <p className="text-xs text-gray-500">
                            My Account
                        </p>
                    </div>

                    <ChevronDown
                        size={17}
                        className="hidden text-gray-400 transition-transform group-hover:text-gray-600 lg:block"
                    />
                </button>
            }
        >
            {/* User header */}
            <div className="border-b border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4">
                <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                        <Image
                            src={avatar}
                            alt={user.username}
                            width={56}
                            height={56}
                            className="h-14 w-14 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />

                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    </div>

                    <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                            {user.username}
                        </p>

                        <p className="mt-0.5 truncate text-xs text-gray-500">
                            {user.email}
                        </p>

                        <Link
                            href="/profile"
                            className="mt-1 inline-block text-xs font-medium text-blue-600 transition hover:text-blue-700"
                        >
                            View profile
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick actions */}
            <div className="border-b border-gray-100 p-2">
                <Link href="/sell">
                    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-900 text-white">
                            <Plus size={18} />
                        </div>

                        <div>
                            <p>Sell an item</p>
                            <p className="text-xs font-normal text-gray-500">
                                Create a new listing
                            </p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Main navigation */}
            <div className="p-2">
                <DropdownItem
                    href="/profile"
                    icon={<UserIcon size={18} />}
                >
                    Profile
                </DropdownItem>

                <DropdownItem
                    href="/profile/listings"
                    icon={<Package size={18} />}
                >
                    My Listings
                </DropdownItem>

                <DropdownItem
                    href="/favorites"
                    icon={<Heart size={18} />}
                >
                    Favorites
                </DropdownItem>

                <DropdownItem
                    href="/messages"
                    icon={<MessageCircle size={18} />}
                >
                    Messages
                </DropdownItem>

                <DropdownItem
                    href="/notifications"
                    icon={<Bell size={18} />}
                >
                    Notifications
                </DropdownItem>

                <DropdownItem
                    href="/settings"
                    icon={<Settings size={18} />}
                >
                    Settings
                </DropdownItem>
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 p-2">
                <DropdownItem
                    danger
                    icon={
                        <LogOut size={18} />
                    }
                    onClick={handleLogout}
                >
                    Logout
                </DropdownItem>
            </div>
        </Dropdown>
    );
}