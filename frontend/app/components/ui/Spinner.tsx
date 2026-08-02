"use client";

import clsx from "clsx";

interface SpinnerProps {
    size?: "sm" | "md" | "lg" | "xl";
    color?: "primary" | "white" | "gray";
    className?: string;
}

const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-[3px]",
    lg: "h-8 w-8 border-4",
    xl: "h-12 w-12 border-4",
};

const colors = {
    primary:
        "border-blue-600 border-t-transparent",
    white:
        "border-white border-t-transparent",
    gray:
        "border-gray-400 border-t-transparent",
};

export default function Spinner({
    size = "md",
    color = "primary",
    className,
}: SpinnerProps) {
    return (
        <div
            className={clsx(
                "inline-block animate-spin rounded-full",
                sizes[size],
                colors[color],
                className
            )}
        />
    );
}