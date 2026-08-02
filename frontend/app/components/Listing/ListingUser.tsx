"use client";

import { MapPin, ShieldCheck } from "lucide-react";
import { cn } from "@/app/lib/cn";

interface Props {
    username: string;
    city?: string;
    verified?: boolean;
    rating?: number;
}

export default function ListingUser({
    username,
    city,
    verified = false,
    rating,
}: Props) {
    return (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">

            <div className="min-w-0">

                <div className="flex items-center gap-1.5">

                    <p className="truncate text-sm font-semibold text-gray-900">
                        {username}
                    </p>

                    {verified && (
                        <ShieldCheck
                            size={15}
                            className="text-blue-600"
                        />
                    )}

                </div>

                {city && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">

                        <MapPin size={13} />

                        <span className="truncate">
                            {city}
                        </span>

                    </div>
                )}

            </div>

            {rating !== undefined && (
                <div
                    className={cn(
                        "rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700"
                    )}
                >
                    ⭐ {rating.toFixed(1)}
                </div>
            )}

        </div>
    );
}