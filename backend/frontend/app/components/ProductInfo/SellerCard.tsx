"use client";

import Image from "next/image";
import Link from "next/link";
import {
    BadgeCheck,
    ChevronRight,
    Package,
    Star,
} from "lucide-react";

interface Seller {
    _id: string;
    username: string;
    avatar?: string;
    verified?: boolean;
    rating?: number;
    listingsCount?: number;
}

interface Props {
    seller: Seller;
}

export default function SellerCard({
    seller,
}: Props) {
    return (
        <div className="rounded-3xl border border-gray-200 bg-white p-5">

            <div className="flex items-center gap-4">

                <Image
                    src={
                        seller.avatar ||
                        "/images/default-avatar.png"
                    }
                    alt={seller.username}
                    width={64}
                    height={64}
                    className="rounded-full border object-cover"
                />

                <div className="min-w-0 flex-1">

                    <div className="flex items-center gap-2">

                        <h3 className="truncate text-lg font-bold">

                            {seller.username}

                        </h3>

                        {seller.verified && (

                            <BadgeCheck
                                size={18}
                                className="text-emerald-600"
                            />

                        )}

                    </div>

                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">

                        <div className="flex items-center gap-1">

                            <Star
                                size={15}
                                className="fill-yellow-400 text-yellow-400"
                            />

                            <span>

                                {seller.rating?.toFixed(1) ?? "New"}

                            </span>

                        </div>

                        <div className="flex items-center gap-1">

                            <Package size={15} />

                            <span>

                                {seller.listingsCount ?? 0} listings

                            </span>

                        </div>

                    </div>

                </div>

            </div>

            <Link
                href={`/profile/${seller._id}`}
                className="mt-5 flex items-center justify-center gap-2 rounded-2xl border border-gray-200 py-3 font-semibold transition hover:bg-gray-50"
            >

                View profile

                <ChevronRight size={18} />

            </Link>

        </div>
    );
}