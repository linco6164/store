"use client";

import Skeleton from "./Skeleton";

export default function SellSkeleton() {
    return (
        <main className="mx-auto max-w-screen-2xl px-6 py-10">

            {/* Header */}

            <Skeleton className="mb-8 h-44 rounded-3xl" />

            <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">

                {/* LEFT */}

                <div className="space-y-8">

                    <Skeleton className="h-[420px] rounded-3xl" />

                    <Skeleton className="h-[280px] rounded-3xl" />

                    <Skeleton className="h-[220px] rounded-3xl" />

                    <Skeleton className="h-[260px] rounded-3xl" />

                    <div className="grid gap-8 md:grid-cols-2">

                        <Skeleton className="h-[180px] rounded-3xl" />

                        <Skeleton className="h-[180px] rounded-3xl" />

                    </div>

                    <div className="flex justify-end gap-4 pt-4">

                        <Skeleton className="h-12 w-44 rounded-2xl" />

                        <Skeleton className="h-12 w-52 rounded-2xl" />

                    </div>

                </div>

                {/* RIGHT */}

                <div className="sticky top-24">

                    <Skeleton className="h-[640px] rounded-3xl" />

                </div>

            </div>

        </main>
    );
}