"use client";

import Link from "next/link";

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
        <Link
            href={`/listing/${listing._id}`}
            className="group block"
        >
            <div className="relative">

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

            <div className="mt-3">

                <h3 className="line-clamp-2 text-sm font-medium transition group-hover:text-emerald-600">
                    {listing.title}
                </h3>

                <ListingPrice
                    price={listing.price}
                />

                <ListingUser
                    username={listing.seller.username}
                    city={listing.city}
                />

            </div>
        </Link>
    );
}