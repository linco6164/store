"use client";

import Skeleton from "./Skeleton";

interface ListingCardSkeletonProps {
    count?: number;
}

export default function ListingCardSkeleton({
    count = 8,
}: ListingCardSkeletonProps) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: count }).map(
                (_, index) => (
                    <div
                        key={index}
                        className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                    >
                        {/* Imagine */}

                        <Skeleton className="aspect-square w-full rounded-none" />

                        <div className="space-y-3 p-4">

                            {/* Titlu */}

                            <Skeleton className="h-5 w-4/5" />

                            {/* Preț */}

                            <Skeleton className="h-6 w-24" />

                            {/* Locație */}

                            <Skeleton className="h-4 w-20" />

                            {/* Footer */}

                            <div className="flex items-center justify-between pt-2">

                                <Skeleton className="h-8 w-24 rounded-full" />

                                <Skeleton className="h-8 w-8 rounded-full" />

                            </div>

                        </div>

                    </div>
                )
            )}
        </div>
    );
}