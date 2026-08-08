"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, RefreshCw } from "lucide-react";

import Dropdown from "../ui/Dropdown";
import EmptyState from "../ui/EmptyState";

import type { FavoriteListing } from "@/app/services/favorite.service";

interface Props {
    trigger: React.ReactNode;
    favorites: FavoriteListing[];
    loading?: boolean;
    onReload?: () => Promise<void>;
}

export default function FavoritesDropdown({
    trigger,
    favorites,
    loading = false,
    onReload,
}: Props) {
    return (
        <Dropdown
            width="lg"
            trigger={trigger}
        >
            {/* Header */}
            <div className="border-b border-gray-100 px-5 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Favorite
                        </h3>

                        <p className="mt-0.5 text-xs text-gray-500">
                            Produsele salvate de tine
                        </p>
                    </div>

                    {onReload && !loading && (
                        <button
                            type="button"
                            onClick={() =>
                                void onReload()
                            }
                            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                            title="Reîncarcă"
                        >
                            <RefreshCw size={17} />
                        </button>
                    )}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-3 p-4">
                    {[1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="flex animate-pulse items-center gap-4 rounded-xl p-2"
                        >
                            <div className="h-16 w-16 shrink-0 rounded-xl bg-gray-200" />

                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-4 w-3/4 rounded bg-gray-200" />

                                <div className="h-4 w-1/3 rounded bg-gray-200" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty */}
            {!loading &&
                favorites.length === 0 && (
                    <div className="p-6">
                        <EmptyState
                            icon={
                                <Heart size={34} />
                            }
                            title="Nu ai produse favorite"
                            description="Produsele salvate vor apărea aici."
                        />
                    </div>
                )}

            {/* Favorites */}
            {!loading &&
                favorites.length > 0 && (
                    <>
                        <div className="max-h-[420px] overflow-y-auto">
                            {favorites.map(
                                (favorite) => {
                                    const listing =
                                        favorite.listing;

                                    const image =
                                        listing.images?.[0] ||
                                        "/images/placeholder.png";

                                    return (
                                        <Link
                                            key={
                                                favorite._id
                                            }
                                            href={`/listing/${listing._id}`}
                                            className="group flex items-center gap-4 border-b border-gray-100 px-5 py-4 transition hover:bg-gray-50"
                                        >
                                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                                                <Image
                                                    src={
                                                        image
                                                    }
                                                    alt={
                                                        listing.title
                                                    }
                                                    fill
                                                    sizes="64px"
                                                    className="object-cover transition duration-300 group-hover:scale-105"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-semibold text-gray-900">
                                                    {
                                                        listing.title
                                                    }
                                                </p>

                                                <div className="mt-1 flex items-center gap-2">
                                                    <p className="font-semibold text-emerald-600">
                                                        {
                                                            listing.price
                                                        }{" "}
                                                        Lei
                                                    </p>

                                                    {listing.city && (
                                                        <>
                                                            <span className="text-gray-300">
                                                                •
                                                            </span>

                                                            <p className="truncate text-xs text-gray-500">
                                                                {
                                                                    listing.city
                                                                }
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            <Heart
                                                size={17}
                                                className="shrink-0 fill-red-500 text-red-500 opacity-0 transition group-hover:opacity-100"
                                            />
                                        </Link>
                                    );
                                }
                            )}
                        </div>

                        <div className="border-t border-gray-100 p-3">
                            <Link
                                href="/favorites"
                                className="block rounded-xl py-2.5 text-center text-sm font-semibold text-blue-600 transition hover:bg-blue-50"
                            >
                                Vezi toate favoritele
                            </Link>
                        </div>
                    </>
                )}
        </Dropdown>
    );
}