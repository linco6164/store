"use client";

import ListingCardSkeleton from "./ListingCardSkeleton";

interface Props {
    count?: number;
}

export default function GridSkeleton({
    count = 8,
}: Props) {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

            {Array.from({
                length: count,
            }).map((_, index) => (
                <ListingCardSkeleton
                    key={index}
                />
            ))}

        </div>
    );
}