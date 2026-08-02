"use client";

import Skeleton from "./Skeleton";

export default function SellSkeleton() {
    return (
        <div className="mx-auto max-w-7xl space-y-8">

            <Skeleton className="h-36 rounded-3xl" />

            <div className="grid gap-8 xl:grid-cols-[1fr_340px]">

                <div className="space-y-6">

                    <Skeleton className="h-80 rounded-3xl" />

                    <Skeleton className="h-72 rounded-3xl" />

                    <Skeleton className="h-56 rounded-3xl" />

                    <Skeleton className="h-56 rounded-3xl" />

                </div>

                <Skeleton className="h-[620px] rounded-3xl" />

            </div>

        </div>
    );
}