"use client";

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

            <div className="flex items-center justify-between">

                <h2 className="text-2xl font-bold">
                    Anunțurile mele
                </h2>

                <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600">
                    {listings.length} anunțuri
                </span>

            </div>

            {listings.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-gray-300 bg-white py-20 text-center">

                    <h3 className="text-xl font-semibold">
                        Nu ai publicat niciun anunț
                    </h3>

                    <p className="mt-3 text-gray-500">
                        Publică primul tău produs și începe să vinzi.
                    </p>

                    <a
                        href="/sell"
                        className="
                            mt-8
                            inline-flex
                            rounded-xl
                            bg-black
                            px-6
                            py-3
                            font-medium
                            text-white
                            transition
                            hover:opacity-90
                        "
                    >
                        Publică un anunț
                    </a>

                </div>
            ) : (
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
            )}

        </section>
    );
}