"use client";

import Skeleton from "./Skeleton";

export default function ListingCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm">

            <Skeleton className="aspect-[4/5] w-full" />

            <div className="space-y-3 p-4">

                <Skeleton className="h-5 w-3/4" />

                <Skeleton className="h-4 w-1/2" />

                <Skeleton className="h-4 w-1/3" />

            </div>

        </div>
    );
}