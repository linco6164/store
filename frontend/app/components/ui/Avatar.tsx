"use client";

import Image from "next/image";
import clsx from "clsx";

interface AvatarProps {
    src?: string | null;
    alt?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    online?: boolean;
    className?: string;
}

const sizes = {
    xs: {
        wrapper: "h-8 w-8",
        dot: "h-2.5 w-2.5",
    },
    sm: {
        wrapper: "h-10 w-10",
        dot: "h-3 w-3",
    },
    md: {
        wrapper: "h-12 w-12",
        dot: "h-3.5 w-3.5",
    },
    lg: {
        wrapper: "h-16 w-16",
        dot: "h-4 w-4",
    },
    xl: {
        wrapper: "h-24 w-24",
        dot: "h-5 w-5",
    },
};

export default function Avatar({
    src,
    alt = "Avatar",
    size = "md",
    online,
    className,
}: AvatarProps) {
    return (
        <div
            className={clsx(
                "relative overflow-hidden rounded-full bg-gray-100",
                sizes[size].wrapper,
                className
            )}
        >
            <Image
                src={
                    src ||
                    "/images/default-avatar.png"
                }
                alt={alt}
                fill
                className="object-cover"
            />

            {online !== undefined && (
                <span
                    className={clsx(
                        "absolute bottom-0 right-0 rounded-full border-2 border-white",
                        online
                            ? "bg-green-500"
                            : "bg-gray-400",
                        sizes[size].dot
                    )}
                />
            )}
        </div>
    );
}