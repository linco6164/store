"use client";

import Link from "next/link";
import {
    Package,
    Plus,
    ArrowRight,
} from "lucide-react";

import { Listing } from "@/app/types/listing";

import ListingCard from "@/app/components/Listing/ListingCard";

interface Props {
    listings: Listing[];
}

export default function MyListings({
    listings,
}: Props) {
    return (
        <section className="space-y-6">

            {/* Section header */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

                <div>
                    <div className="flex items-center gap-2">
                        <Package
                            size={19}
                            className="text-gray-500"
                        />

                        <h2 className="text-xl font-bold tracking-tight text-gray-950">
                            Anunțurile mele
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                        Gestionează produsele pe care le-ai
                        publicat.
                    </p>
                </div>

                {listings.length > 0 && (
                    <div className="flex items-center gap-3">
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-600">
                            {listings.length}{" "}
                            {listings.length === 1
                                ? "anunț"
                                : "anunțuri"}
                        </span>

                        <Link
                            href="/profile/listings"
                            className="group hidden items-center gap-1.5 text-sm font-semibold text-gray-600 transition hover:text-gray-950 sm:inline-flex"
                        >
                            Vezi toate

                            <ArrowRight
                                size={16}
                                className="transition-transform group-hover:translate-x-0.5"
                            />
                        </Link>
                    </div>
                )}
            </div>

            {/* Empty state */}

            {listings.length === 0 ? (
                <div className="relative overflow-hidden rounded-3xl border border-dashed border-gray-300 bg-gradient-to-br from-gray-50 via-white to-blue-50/40 px-6 py-16 text-center sm:py-20">

                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-100/40 blur-2xl" />

                    <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-gray-100 blur-2xl" />

                    <div className="relative mx-auto max-w-md">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm ring-1 ring-gray-200">
                            <Package size={28} />
                        </div>

                        <h3 className="mt-6 text-lg font-bold text-gray-900">
                            Nu ai publicat niciun anunț
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Publică primul tău produs și începe
                            să vinzi pe Nexora.
                        </p>

                        <Link
                            href="/sell"
                            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 hover:shadow-md"
                        >
                            <Plus size={17} />

                            Publică un anunț
                        </Link>

                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                    {listings.map(
                        (listing) => (
                            <ListingCard
                                key={
                                    listing._id
                                }
                                listing={
                                    listing
                                }
                            />
                        )
                    )}
                </div>
            )}

            {/* Mobile / secondary action */}

            {listings.length > 0 && (
                <div className="flex justify-center pt-2 sm:hidden">
                    <Link
                        href="/profile/listings"
                        className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                        Vezi toate anunțurile

                        <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                        />
                    </Link>
                </div>
            )}

        </section>
    );
}