"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { Container } from "@/app/components/layout";
import { ListingGrid } from "@/app/components/Listing";

import { Listing } from "@/app/types/listing";

interface Props {
    listings: Listing[];
    loading?: boolean;
}

export default function SimilarListings({
    listings,
    loading = false,
}: Props) {
    return (
        <section className="py-20">

            <Container>

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                    }}
                    viewport={{
                        once: true,
                    }}
                    transition={{
                        duration: .35,
                    }}
                    className="mb-10 flex items-center justify-between"
                >

                    <div>

                        <h2 className="text-3xl font-bold text-gray-900">

                            Similar Listings

                        </h2>

                        <p className="mt-2 text-gray-500">

                            You might also be interested in these listings.

                        </p>

                    </div>

                    <Link
                        href="/search"
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-5 py-3 font-semibold transition hover:bg-gray-50"
                    >

                        Browse More

                        <ArrowRight size={18} />

                    </Link>

                </motion.div>

                <ListingGrid
                    listings={listings}
                    loading={loading}
                />

            </Container>

        </section>
    );
}