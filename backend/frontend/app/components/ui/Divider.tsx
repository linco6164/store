"use client";

import clsx from "clsx";

interface DividerProps {
    orientation?: "horizontal" | "vertical";
    label?: string;
    className?: string;
}

export default function Divider({
    orientation = "horizontal",
    label,
    className,
}: DividerProps) {
    if (orientation === "vertical") {
        return (
            <div
                className={clsx(
                    "mx-2 h-full min-h-[20px] w-px bg-gray-200",
                    className
                )}
            />
        );
    }

    if (!label) {
        return (
            <div
                className={clsx(
                    "h-px w-full bg-gray-200",
                    className
                )}
            />
        );
    }

    return (
        <div
            className={clsx(
                "flex items-center gap-4",
                className
            )}
        >
            <div className="h-px flex-1 bg-gray-200" />

            <span className="text-sm font-medium text-gray-500">
                {label}
            </span>

            <div className="h-px flex-1 bg-gray-200" />
        </div>
    );
}