"use client";

import clsx from "clsx";

interface OnlineBadgeProps {
    online: boolean;
    lastSeen?: string | Date;
    size?: "sm" | "md";
}

export default function OnlineBadge({
    online,
    lastSeen,
    size = "md",
}: OnlineBadgeProps) {
    const dotSize =
        size === "sm"
            ? "h-2.5 w-2.5"
            : "h-3.5 w-3.5";

    if (size === "sm") {
        return (
            <span
                className={clsx(
                    "block rounded-full border-2 border-white",
                    online
                        ? "bg-green-500"
                        : "bg-gray-400",
                    dotSize
                )}
            />
        );
    }

    return (
        <div className="flex items-center gap-2">

            <span
                className={clsx(
                    "rounded-full bg-gray-400",
                    dotSize
                )}
            />

            <span className="text-sm text-gray-500">
                {lastSeen
                    ? `Ultima activitate ${formatLastSeen(
                        lastSeen
                    )}`
                    : "Offline"}
            </span>

        </div>
    );
}

function formatLastSeen(
    value: string | Date
) {
    const date = new Date(value);

    const diff =
        Date.now() - date.getTime();

    const minutes = Math.floor(
        diff / 60000
    );

    if (minutes < 1)
        return "acum";

    if (minutes < 60)
        return `acum ${minutes} min`;

    const hours = Math.floor(
        minutes / 60
    );

    if (hours < 24)
        return `acum ${hours} h`;

    const days = Math.floor(
        hours / 24
    );

    return `acum ${days} zile`;
}