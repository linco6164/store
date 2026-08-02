"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";

import Dropdown from "../ui/Dropdown";
import HeaderIconButton from "./HeaderIconButton";
import EmptyState from "../ui/EmptyState";

interface FavoriteItem {
    id: string;
    title: string;
    image: string;
    price: number;
}

interface Props {
    favorites?: FavoriteItem[];
}

export default function FavoritesDropdown({
    favorites = [],
}: Props) {
    return (
        <Dropdown
            width="lg"
            trigger={
                <HeaderIconButton
                    icon={<Heart size={21} />}
                    tooltip="Favorite"
                    count={favorites.length}
                    danger
                />
            }
        >
            <div className="border-b px-5 py-4">
                <h3 className="text-lg font-semibold">
                    Favorite
                </h3>
            </div>

            {favorites.length === 0 ? (
                <div className="p-6">
                    <EmptyState
                        icon={<Heart size={34} />}
                        title="Nu ai produse favorite"
                        description="Produsele salvate vor apărea aici."
                    />
                </div>
            ) : (
                <>
                    <div className="max-h-[420px] overflow-y-auto">
                        {favorites.map((item) => (
                            <Link
                                key={item.id}
                                href={`/listing/${item.id}`}
                                className="flex items-center gap-4 border-b px-5 py-4 transition hover:bg-gray-50"
                            >
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    width={60}
                                    height={60}
                                    className="rounded-xl object-cover"
                                />

                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold">
                                        {item.title}
                                    </p>

                                    <p className="mt-1 font-semibold text-emerald-600">
                                        {item.price} Lei
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="border-t p-3">
                        <Link
                            href="/favorites"
                            className="block rounded-xl py-2 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                        >
                            Vezi toate favoritele
                        </Link>
                    </div>
                </>
            )}
        </Dropdown>
    );
}