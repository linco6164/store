"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";

import { useFavorite } from "@/app/hooks/useFavorites";
import { cn } from "@/app/lib/cn";

interface ListingFavoriteProps {
    listingId: string;
    initialFavorite?: boolean;
    size?: "sm" | "md" | "lg";
    showLabel?: boolean;
    className?: string;
}

const sizes = {
    sm: {
        button: "h-9 w-9",
        icon: 17,
    },
    md: {
        button: "h-11 w-11",
        icon: 20,
    },
    lg: {
        button: "h-12 px-4",
        icon: 21,
    },
};

export default function ListingFavorite({
    listingId,
    initialFavorite = false,
    size = "md",
    showLabel = false,
    className,
}: ListingFavoriteProps) {
    const {
        favorite,
        loading,
        toggling,
        toggle,
    } = useFavorite(
        listingId,
        initialFavorite
    );

    const currentSize = sizes[size];

    async function handleClick(
        event: React.MouseEvent<HTMLButtonElement>
    ) {
        event.preventDefault();
        event.stopPropagation();

        await toggle();
    }

    return (
        <motion.button
            type="button"
            onClick={handleClick}
            disabled={loading || toggling}
            whileTap={{
                scale: 0.9,
            }}
            whileHover={{
                scale: 1.04,
            }}
            aria-label={
                favorite
                    ? "Remove from favorites"
                    : "Add to favorites"
            }
            aria-pressed={favorite}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full border bg-white shadow-sm transition-all duration-200",
                favorite
                    ? "border-red-100 text-red-500"
                    : "border-gray-200 text-gray-500 hover:border-gray-300 hover:text-gray-700",
                (loading || toggling) &&
                    "cursor-wait opacity-70",
                currentSize.button,
                className
            )}
        >
            <motion.span
                key={favorite ? "active" : "inactive"}
                initial={{
                    scale: 0.7,
                    opacity: 0,
                }}
                animate={{
                    scale: 1,
                    opacity: 1,
                }}
                transition={{
                    duration: 0.15,
                }}
            >
                <Heart
                    size={currentSize.icon}
                    strokeWidth={2}
                    className={cn(
                        "transition-colors",
                        favorite &&
                            "fill-current"
                    )}
                />
            </motion.span>

            {showLabel && (
                <span className="text-sm font-semibold">
                    {favorite
                        ? "Saved"
                        : "Save"}
                </span>
            )}
        </motion.button>
    );
}