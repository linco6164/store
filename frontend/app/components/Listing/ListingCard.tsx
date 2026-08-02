"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { Listing } from "@/app/types/listing";

import ListingBadge from "./ListingBadge";
import ListingFavorite from "./ListingFavorite";
import ListingImage from "./ListingImage";
import ListingPrice from "./ListingPrice";
import ListingUser from "./ListingUser";

interface Props {
    listing: Listing;
}

export default function ListingCard({
    listing,
}: Props) {
    return (
        <motion.div
            whileHover={{
                y: -6,
            }}
            transition={{
                duration: 0.2,
            }}
        >
            <Link
                href={`/listing/${listing._id}`}
                className="group block overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:border-gray-300 hover:shadow-xl"
            >
                <div className="relative overflow-hidden">

                    <ListingImage
                        image={listing.images[0]}
                        title={listing.title}
                    />

                    <ListingBadge
                        condition={listing.condition}
                    />

                    <ListingFavorite
                        favorite={listing.favorite}
                    />

                </div>

                <div className="space-y-3 p-5">

                    <h3 className="line-clamp-2 text-[15px] font-semibold leading-6 text-gray-900 transition-colors group-hover:text-emerald-600">
                        {listing.title}
                    </h3>

                    <ListingPrice
                        price={listing.price}
                    />

                    <ListingUser
                        username={
                            listing.seller.username
                        }
                        city={listing.city}
                    />

                </div>

            </Link>
        </motion.div>
    );
}