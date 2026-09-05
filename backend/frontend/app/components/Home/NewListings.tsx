"use client";

import Link from "next/link";
import { ArrowRight, Clock3 } from "lucide-react";

import { Container } from "../layout";
import { ListingGrid } from "../Listing";

import { Listing } from "@/app/types/listing";

interface Props {
    listings: Listing[];
    loading?: boolean;
}

export default function NewListings({
    listings,
    loading = false,
}: Props) {
    return (
        <section className="py-16 bg-gray-50">

            <Container>

                <div className="mb-8 flex items-center justify-between">

                    <div>

                        <div className="flex items-center gap-2">

                            <Clock3
                                size={24}
                                className="text-emerald-600"
                            />

                            <h2 className="text-3xl font-bold text-gray-900">
                                New Listings
                            </h2>

                        </div>

                        <p className="mt-2 text-gray-500">
                            The latest products added by our community.
                        </p>

                    </div>

                    <Link
                        href="/search?sort=newest"
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold transition hover:bg-gray-100"
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