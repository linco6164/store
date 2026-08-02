"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/app/lib/cn";

interface Props {
    favorite?: boolean;
    onToggle?: (favorite: boolean) => void;
}

export default function ListingFavorite({
    favorite = false,
    onToggle,
}: Props) {
    const [isFavorite, setIsFavorite] =
        useState(favorite);

    function handleClick(
        e: React.MouseEvent
    ) {
        e.preventDefault();
        e.stopPropagation();

        const next = !isFavorite;

        setIsFavorite(next);

        onToggle?.(next);
    }

    return (
        <button
            onClick={handleClick}
            aria-label="Favorite"
            className={cn(
                "absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/90 shadow-lg backdrop-blur-md transition-all duration-300",

                "hover:scale-110 hover:bg-white",

                isFavorite &&
                    "bg-red-50"
            )}
        >
            <Heart
                size={20}
                className={cn(
                    "transition-all duration-300",

                    isFavorite
                        ? "fill-red-500 text-red-500 scale-110"
                        : "text-gray-600"
                )}
            />
        </button>
    );
}