"use client";

import clsx from "clsx";

interface SkeletonProps {
    className?: string;
}

export default function Skeleton({
    className,
}: SkeletonProps) {
    return (
        <div
            className={clsx(
                "relative overflow-hidden rounded-xl bg-gray-200",
                className
            )}
        >
            <div
                className="
                    absolute
                    inset-0
                    -translate-x-full
                    animate-[shimmer_1.4s_infinite]
                    bg-gradient-to-r
                    from-transparent
                    via-white/70
                    to-transparent
                "
            />
        </div>
    );
}