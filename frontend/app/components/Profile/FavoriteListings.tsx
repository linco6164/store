"use client";

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
            <EmptyState
                title="Nu ai produse favorite"
                description="Salvează produsele care îți plac pentru a le găsi rapid."
            />
        );
    }

    return (
        <section className="space-y-6">

            <div className="flex items-center justify-between">

                <h2 className="text-2xl font-bold">
                    Produse favorite
                </h2>

                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                    {listings.length} produse
                </span>

            </div>

            <div
                className="
                    grid
                    grid-cols-2
                    gap-5

                    md:grid-cols-3

                    xl:grid-cols-4
                "
            >
                {listings.map((listing) => (
                    <ListingCard
                        key={listing._id}
                        listing={listing}
                    />
                ))}
            </div>

        </section>
    );
}