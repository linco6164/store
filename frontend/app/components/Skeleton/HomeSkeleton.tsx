"use client";

import Skeleton from "./Skeleton";
import GridSkeleton from "./GridSkeleton";

export default function HomeSkeleton() {
    return (
        <div className="space-y-14">

            <Skeleton className="h-[520px] rounded-none" />

            <div className="mx-auto max-w-7xl space-y-10 px-6">

                <Skeleton className="h-10 w-72" />

                <GridSkeleton />

            </div>

        </div>
    );
}