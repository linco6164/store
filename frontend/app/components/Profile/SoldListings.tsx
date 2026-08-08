"use client";

import Link from "next/link";

import {
    ArrowRight,
    CheckCircle2,
    PackageCheck,
    ShoppingBag,
} from "lucide-react";

import { Listing } from "@/app/types/listing";

import ListingCard from "@/app/components/Listing/ListingCard";

interface Props {
    listings: Listing[];
}

export default function SoldListings({
    listings,
}: Props) {
    if (listings.length === 0) {
        return (
            <section className="relative overflow-hidden rounded-3xl border border-dashed border-gray-300 bg-gradient-to-br from-emerald-50/50 via-white to-gray-50 px-6 py-16 text-center sm:py-20">
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-100/50 blur-3xl" />

                <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-gray-100 blur-3xl" />

                <div className="relative mx-auto max-w-md">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-emerald-500 shadow-sm ring-1 ring-gray-200">
                        <PackageCheck size={29} />
                    </div>

                    <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">
                        <CheckCircle2 size={13} />
                        Vânzări
                    </div>

                    <h3 className="mt-3 text-lg font-bold text-gray-900">
                        Nu ai produse vândute
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                        Produsele pe care le-ai marcat ca vândute
                        vor apărea aici.
                    </p>

                    <Link
                        href="/sell"
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 hover:shadow-md"
                    >
                        <ShoppingBag size={17} />

                        Publică un produs
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
                        <PackageCheck
                            size={19}
                            className="text-emerald-600"
                        />

                        <h2 className="text-xl font-bold tracking-tight text-gray-950">
                            Produse vândute
                        </h2>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                        Produsele pentru care tranzacția a fost
                        finalizată.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-600">
                        {listings.length}{" "}
                        {listings.length === 1
                            ? "produs"
                            : "produse"}
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
            </div>

            {/* Grid */}

            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                {listings.map((listing) => (
                    <ListingCard
                        key={listing._id}
                        listing={listing}
                    />
                ))}
            </div>

            {/* Mobile */}

            <div className="flex justify-center pt-2 sm:hidden">
                <Link
                    href="/profile/listings"
                    className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                    Vezi toate produsele

                    <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-0.5"
                    />
                </Link>
            </div>
        </section>
    );
}