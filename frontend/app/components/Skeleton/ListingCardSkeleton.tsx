"use client";

import Skeleton from "./Skeleton";

export default function ListingCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">

            {/* Image */}

            <Skeleton className="aspect-[4/5] w-full" />

            {/* Content */}

            <div className="space-y-4 p-4">

                {/* Title */}

                <div className="space-y-2">

                    <Skeleton className="h-5 w-5/6" />

                    <Skeleton className="h-5 w-2/3" />

                </div>

                {/* Price */}

                <Skeleton className="h-7 w-24 rounded-lg" />

                {/* Seller */}

                <div className="flex items-center gap-3">

                    <Skeleton className="h-10 w-10 rounded-full" />

                    <div className="flex-1 space-y-2">

                        <Skeleton className="h-4 w-24" />

                        <Skeleton className="h-3 w-20" />

                    </div>

                </div>

            </div>

        </div>
    );
}