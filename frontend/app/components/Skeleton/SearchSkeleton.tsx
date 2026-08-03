"use client";

import Skeleton from "./Skeleton";
import GridSkeleton from "./GridSkeleton";

export default function SearchSkeleton() {
    return (
        <main className="mx-auto max-w-7xl px-6 py-8">

            {/* Search Bar */}

            <div className="mb-8">

                <Skeleton className="h-14 w-full rounded-2xl" />

            </div>

            {/* Filters */}

            <div className="mb-10 flex flex-wrap gap-3">

                <Skeleton className="h-10 w-28 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-20 rounded-full" />

            </div>

            {/* Results */}

            <div className="mb-8 flex items-center justify-between">

                <Skeleton className="h-8 w-52" />

                <Skeleton className="h-10 w-40 rounded-xl" />

            </div>

            <GridSkeleton count={12} />

        </main>
    );
}