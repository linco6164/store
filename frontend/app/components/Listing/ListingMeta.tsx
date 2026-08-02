"use client";

import { Clock3, Eye } from "lucide-react";

interface Props {
    createdAt?: string;
    views?: number;
}

export default function ListingMeta({
    createdAt,
    views,
}: Props) {
    return (
        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">

            {createdAt ? (
                <div className="flex items-center gap-1">
                    <Clock3 size={14} />
                    <span>
                        {formatDate(createdAt)}
                    </span>
                </div>
            ) : (
                <div />
            )}

            {views !== undefined && (
                <div className="flex items-center gap-1">
                    <Eye size={14} />
                    <span>{views}</span>
                </div>
            )}

        </div>
    );
}

function formatDate(date: string) {
    const diff =
        Date.now() -
        new Date(date).getTime();

    const minutes = Math.floor(
        diff / 60000
    );

    if (minutes < 1)
        return "acum";

    if (minutes < 60)
        return `${minutes} min`;

    const hours = Math.floor(
        minutes / 60
    );

    if (hours < 24)
        return `${hours} h`;

    const days = Math.floor(
        hours / 24
    );

    if (days < 30)
        return `${days} zile`;

    return new Date(date).toLocaleDateString(
        "ro-RO"
    );
}