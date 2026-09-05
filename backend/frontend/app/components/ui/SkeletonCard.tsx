"use client";

import Skeleton from "./Skeleton";

export default function SkeletonCard() {
    return (
        <div className="rounded-3xl border bg-white p-4">

            <Skeleton className="aspect-square w-full rounded-2xl" />

            <Skeleton className="mt-4 h-5 w-4/5" />

            <Skeleton className="mt-2 h-4 w-2/5" />

            <Skeleton className="mt-5 h-10 w-full rounded-xl" />

        </div>
    );
}