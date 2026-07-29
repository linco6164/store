"use client";

import Hero from "../components/Home/Hero";
import Categories from "../components/Home/Categories";
import ListingGrid from "../components/Listing/ListingGrid";
import { useListings } from "../hooks/useListings";

export default function HomePage() {
    const { listings, loading } = useListings();

    return (
        <main className="mx-auto max-w-7xl px-4 py-10">
            <Hero />

            <Categories />

            {loading ? (
                <div className="mt-10 text-center text-gray-500">
                    Se încarcă anunțurile...
                </div>
            ) : (
                <ListingGrid listings={listings} />
            )}
        </main>
    );
}