"use client";

import Link from "next/link";

import {
    ArrowRight,
    Heart,
    Sparkles,
} from "lucide-react";

import { Listing } from "@/app/types/listing";

import ListingCard from "@/app/components/Listing/ListingCard";

import EmptyState from "./EmptyState";

interface Props {
    listings: Listing[];
}

export default function FavoriteListings({
    listings,
}: Props) {
    if (listings.length === 0) {
        return (
            <section className="relative overflow-hidden rounded-3xl border border-dashed border-gray-300 bg-gradient-to-br from-red-50/50 via-white to-gray-50 px-6 py-16 text-center sm:py-20">

                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-red-100/50 blur-3xl" />

                <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-gray-100 blur-3xl" />

                <div className="relative mx-auto max-w-md">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-red-400 shadow-sm ring-1 ring-gray-200">
                        <Heart
                            size={29}
                            fill="currentColor"
                        />
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        <Sparkles size={13} />

                        Saved items
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-gray-900">
                        Nu ai produse favorite
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        Salvează produsele care îți plac
                        pentru a le găsi rapid mai târziu.
                    </p>

                    <Link
                        href="/search"
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 hover:shadow-md"
                    >
                        Descoperă produse

                        <ArrowRight
                            size={17}
                        />
                    </Link>

                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">

            {/* Header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>
                    <div className="flex items-center gap-2">
                        <Heart
                            size={19}
                            className="text-red-500"
                            fill="currentColor"
                        />

                        <h2 className="text-xl font-bold tracking-tight text-gray-950">
                            Produse favorite
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                        Produsele pe care le-ai salvat.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="rounded-full border border-red-100 bg-red-50 px-3.5 py-1.5 text-xs font-semibold text-red-600">
                        {listings.length}{" "}
                        {listings.length === 1
                            ? "produs"
                            : "produse"}
                    </span>

                    <Link
                        href="/favorites"
                        className="group hidden items-center gap-1.5 text-sm font-semibold text-gray-600 transition hover:text-gray-950 sm:inline-flex"
                    >
                        Vezi toate

                        <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                        />
                    </Link>
                </div>
            </div>

            {/* Grid */}

            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {listings.map(
                    (listing) => (
                        <ListingCard
                            key={listing._id}
                            listing={listing}
                        />
                    )
                )}
            </div>

            {/* Mobile */}

            <div className="flex justify-center pt-2 sm:hidden">
                <Link
                    href="/favorites"
                    className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                    Vezi toate favoritele

                    <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-0.5"
                    />
                </Link>
            </div>

        </section>
    );
}