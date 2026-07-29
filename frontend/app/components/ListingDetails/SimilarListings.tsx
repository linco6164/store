"use client";

import Link from "next/link";

import { Listing } from "@/app/types/listing";
import ListingCard from "../Listing/ListingCard";

type SimilarListingsProps = {
    listings: Listing[];
    currentListingId: string;
};

export default function SimilarListings({
    listings,
    currentListingId,
}: SimilarListingsProps) {
    const similarListings = listings
        .filter((listing) => listing._id !== currentListingId)
        .slice(0, 8);

    if (!similarListings.length) {
        return null;
    }

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                    Anunțuri similare
                </h2>

                <Link
                    href="/"
                    className="text-sm font-medium text-blue-600 hover:underline"
                >
                    Vezi toate
                </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                {similarListings.map((listing) => (
                    <ListingCard
                        key={listing._id}
                        listing={listing}
                    />
                ))}
            </div>
        </section>
    );
}