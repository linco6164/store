"use client";

import Skeleton from "../ui/Skeleton";

export default function ListingSkeleton() {
    return (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">

            <Skeleton className="aspect-square w-full" />

            <div className="space-y-3 p-5">

                <Skeleton className="h-5 w-4/5" />

                <Skeleton className="h-6 w-2/5" />

                <Skeleton className="h-10 w-full" />

            </div>

        </div>
    );
}