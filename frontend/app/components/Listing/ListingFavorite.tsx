"use client";

import { Heart } from "lucide-react";

interface Props {
    favorite: boolean;
}

export default function ListingFavorite({ favorite }: Props) {
    return (
        <button
            className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow transition hover:scale-110"
        >
            <Heart
                size={20}
                className={
                    favorite
                        ? "fill-red-500 text-red-500"
                        : "text-gray-700"
                }
            />
        </button>
    );
}