"use client";

import clsx from "clsx";

interface SkeletonProps {
    className?: string;
    rounded?: "sm" | "md" | "lg" | "full";
}

export default function Skeleton({
    className,
    rounded = "md",
}: SkeletonProps) {
    return (
        <div
            className={clsx(
                "animate-pulse bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 bg-[length:200%_100%]",
                {
                    "rounded": rounded === "sm",
                    "rounded-xl": rounded === "md",
                    "rounded-2xl": rounded === "lg",
                    "rounded-full": rounded === "full",
                },
                className
            )}
        />
    );
}