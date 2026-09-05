"use client";

import Skeleton from "./Skeleton";
import GridSkeleton from "./GridSkeleton";

export default function HomeSkeleton() {
    return (
        <div className="animate-in fade-in duration-300">

            {/* Hero */}

            <Skeleton className="h-[540px] w-full rounded-none" />

            {/* Categories */}

            <section className="mx-auto mt-16 max-w-7xl px-6">

                <Skeleton className="mb-8 h-10 w-72" />

                <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-8">

                    {Array.from({ length: 8 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="aspect-square rounded-3xl"
                        />
                    ))}

                </div>

            </section>

            {/* Listings */}

            <section className="mx-auto mt-16 max-w-7xl px-6">

                <Skeleton className="mb-8 h-10 w-80" />

                <GridSkeleton count={8} />

            </section>

        </div>
    );
}