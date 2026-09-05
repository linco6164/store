"use client";

import { HTMLAttributes } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    hover?: boolean;
    clickable?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
}

export default function Card({
    children,
    className,
    hover = true,
    clickable = false,
    padding = "md",
    ...props
}: CardProps) {
    return (
        <div
            className={clsx(
                "rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300",

                hover &&
                    "hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl",

                clickable &&
                    "cursor-pointer active:scale-[0.98]",

                {
                    "p-0": padding === "none",
                    "p-3": padding === "sm",
                    "p-5": padding === "md",
                    "p-6": padding === "lg",
                },

                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}