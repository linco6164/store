"use client";

import Image from "next/image";
import Link from "next/link";

interface ChatHeaderProps {
    listing: {
        _id: string;
        title: string;
        price: number;
        images: string[];
    };
}

export default function ChatHeader({
    listing,
}: ChatHeaderProps) {
    const image =
        listing.images?.[0] ?? "/images/placeholder.png";

    return (
        <div className="flex items-center justify-between border-b bg-white p-4">

            <div className="flex items-center gap-4">

                <Image
                    src={image}
                    alt={listing.title}
                    width={64}
                    height={64}
                    className="rounded-lg object-cover"
                />

                <div>

                    <h2 className="font-semibold">
                        {listing.title}
                    </h2>

                    <p className="mt-1 text-lg font-bold">
                        {listing.price.toLocaleString("ro-RO")} lei
                    </p>

                </div>

            </div>

            <Link
                href={`/listing/${listing._id}`}
                className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
                View listing
            </Link>

        </div>
    );
}