"use client";

import Skeleton from "./Skeleton";

interface Props {
    lines?: number;
}

export default function SkeletonText({
    lines = 3,
}: Props) {
    return (
        <div className="space-y-2">
            {Array.from({
                length: lines,
            }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={
                        i === lines - 1
                            ? "h-4 w-2/3"
                            : "h-4 w-full"
                    }
                />
            ))}
        </div>
    );
}