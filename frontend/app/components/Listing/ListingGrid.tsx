"use client";

import { Listing } from "@/app/types/listing";
import ListingCard from "./ListingCard";

interface Props {
    listings: Listing[];
}

export default function ListingGrid({
    listings,
}: Props) {
    if (!listings.length) {
        return (
            <div className="py-20 text-center text-gray-500">
                Nu există anunțuri disponibile.
            </div>
        );
    }

    return (
        <section className="mx-auto max-w-7xl px-4 py-8">

            <h2 className="mb-8 text-2xl font-bold">
                Produse recente
            </h2>

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