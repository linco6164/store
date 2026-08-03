"use client";

import Skeleton from "./Skeleton";

export default function ListingDetailsSkeleton() {
    return (
        <main className="mx-auto max-w-screen-2xl px-6 py-8">

            <div className="grid gap-10 lg:grid-cols-[1fr_420px]">

                {/* Gallery */}

                <div className="space-y-5">

                    <Skeleton className="aspect-[4/3] rounded-3xl" />

                    <div className="grid grid-cols-5 gap-3">

                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="aspect-square rounded-2xl"
                            />
                        ))}

                    </div>

                </div>

                {/* Sidebar */}

                <div className="space-y-6">

                    <Skeleton className="h-10 w-3/4" />

                    <Skeleton className="h-12 w-40" />

                    <Skeleton className="h-28 rounded-3xl" />

                    <Skeleton className="h-16 rounded-2xl" />

                    <Skeleton className="h-48 rounded-3xl" />

                </div>

            </div>

            {/* Description */}

            <section className="mt-12 space-y-5">

                <Skeleton className="h-8 w-60" />

                <Skeleton className="h-5 w-full" />

                <Skeleton className="h-5 w-5/6" />

                <Skeleton className="h-5 w-4/6" />

            </section>

        </main>
    );
}