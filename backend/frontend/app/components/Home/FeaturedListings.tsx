"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "../layout";
import { ListingGrid } from "../Listing";

import { Listing } from "@/app/types/listing";

interface Props {
    listings: Listing[];
    loading?: boolean;
}

export default function FeaturedListings({
    listings,
    loading = false,
}: Props) {
    return (
        <section className="py-16">

            <Container>

                <div className="mb-8 flex items-center justify-between">

                    <div>

                        <h2 className="text-3xl font-bold text-gray-900">
                            Featured Listings
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Discover the most popular products selected for you.
                        </p>

                    </div>

                    <Link
                        href="/search"
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold transition hover:bg-gray-50"
                    >
                        View all

                        <ArrowRight size={18} />

                    </Link>

                </div>

                <ListingGrid
                    listings={listings}
                    loading={loading}
                />

            </Container>

        </section>
    );
}