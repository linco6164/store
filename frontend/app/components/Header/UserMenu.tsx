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

    const handleLogout = async () => {
        await logout();
    };

    return (
        <Dropdown
            width="md"
            trigger={
                <button className="flex items-center gap-3 rounded-2xl px-2 py-1 transition hover:bg-gray-100">
                    <Image
                        src={
                            user.avatar ||
                            "/images/default-avatar.png"
                        }
                        alt={user.username}
                        width={42}
                        height={42}
                        className="rounded-full object-cover"
                    />

                    <div className="hidden text-left lg:block">

                        <p className="text-sm font-semibold">
                            {user.username}
                        </p>

                        <p className="text-xs text-gray-500">
                            My Account
                        </p>

                    </div>

                    <ChevronDown
                        size={18}
                        className="hidden text-gray-500 lg:block"
                    />
                </button>
            }
        >
            <div className="border-b p-4">

                <div className="flex items-center gap-3">

                    <Image
                        src={
                            user.avatar ||
                            "/images/default-avatar.png"
                        }
                        alt={user.username}
                        width={52}
                        height={52}
                        className="rounded-full object-cover"
                    />

                    <div>

                        <p className="font-semibold">
                            {user.username}
                        </p>

                        <p className="text-sm text-gray-500">
                            {user.email}
                        </p>

                    </div>

                </div>

            </div>

            <Link href="/profile">
                <DropdownItem
                    icon={<UserIcon size={18} />}
                >
                    Profile
                </DropdownItem>
            </Link>

            <Link href="/profile/listings">
                <DropdownItem
                    icon={<Package size={18} />}
                >
                    My Listings
                </DropdownItem>
            </Link>

            <Link href="/favorites">
                <DropdownItem
                    icon={<Heart size={18} />}
                >
                    Favorites
                </DropdownItem>
            </Link>

            <Link href="/settings">
                <DropdownItem
                    icon={<Settings size={18} />}
                >
                    Settings
                </DropdownItem>
            </Link>

            <div className="border-t">

                <DropdownItem
                    danger
                    icon={<LogOut size={18} />}
                    onClick={handleLogout}
                >
                    Logout
                </DropdownItem>

            </div>
        </Dropdown>
    );
}