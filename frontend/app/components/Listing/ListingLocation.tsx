"use client";

import { MapPin } from "lucide-react";

interface Props {
    city?: string;
    country?: string;
}

export default function ListingLocation({
    city,
    country,
}: Props) {
    if (!city && !country) return null;

    return (
        <div className="flex items-center gap-1 text-sm text-gray-500">
            <MapPin
                size={15}
                className="flex-shrink-0"
            />

            <span className="truncate">
                {[city, country]
                    .filter(Boolean)
                    .join(", ")}
            </span>
        </div>
    );
}