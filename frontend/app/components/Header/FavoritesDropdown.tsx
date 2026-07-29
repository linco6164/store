"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import Dropdown from "../Dropdown";

export default function FavoritesDropdown() {
    return (
        <Dropdown
            trigger={
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100">
                    <Heart size={22} />

                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] text-white">
                        0
                    </span>
                </div>
            }
        >
            <div className="p-4">

                <h3 className="mb-3 font-semibold">
                    Favorite
                </h3>

                <p className="text-sm text-gray-500">
                    Nu ai produse favorite.
                </p>

                <Link
                    href="/favorites"
                    className="mt-4 block text-center text-sm font-medium text-emerald-600 hover:underline"
                >
                    Vezi toate
                </Link>

            </div>
        </Dropdown>
    );
}