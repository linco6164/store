"use client";

import {
    Hero,
    StatsSection,
    CategorySection,
    FeaturedListings,
    PopularCategories,
    NewListings,
    PromoBanner,
    Newsletter,
} from "../components/Home";

import { useListings } from "@/app/hooks/useListings";

export default function HomePage() {
    const {
        listings,
        loading,
    } = useListings();

    return (
        <>
            <Hero />

            <StatsSection />

            <CategorySection />

            <FeaturedListings
                listings={listings.slice(0, 8)}
                loading={loading}
            />

            <PopularCategories />

            <NewListings
                listings={listings.slice(8, 16)}
                loading={loading}
            />

            <PromoBanner />

            <Newsletter />
        </>
    );
}