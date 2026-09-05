"use client";

import clsx from "clsx";
import { ReactNode } from "react";

type Variant =
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "info";

type Size =
    | "sm"
    | "md"
    | "lg";

interface BadgeProps {
    children?: ReactNode;
    variant?: Variant;
    size?: Size;
    rounded?: boolean;
    dot?: boolean;
    className?: string;
}

export default function Badge({
    children,
    variant = "primary",
    size = "md",
    rounded = true,
    dot = false,
    className,
}: BadgeProps) {
    return (
        <span
            className={clsx(
                "inline-flex items-center gap-1.5 font-medium transition",

                rounded
                    ? "rounded-full"
                    : "rounded-lg",

                {
                    "px-2 py-1 text-xs":
                        size === "sm",

                    "px-3 py-1.5 text-sm":
                        size === "md",

                    "px-4 py-2 text-base":
                        size === "lg",
                },

                {
                    "bg-blue-100 text-blue-700":
                        variant === "primary",

                    "bg-gray-100 text-gray-700":
                        variant === "secondary",

                    "bg-green-100 text-green-700":
                        variant === "success",

                    "bg-yellow-100 text-yellow-700":
                        variant === "warning",

                    "bg-red-100 text-red-700":
                        variant === "danger",

                    "bg-cyan-100 text-cyan-700":
                        variant === "info",
                },

                className
            )}
        >
            {dot && (
                <span
                    className={clsx(
                        "h-2 w-2 rounded-full",

                        {
                            "bg-blue-600":
                                variant === "primary",

                            "bg-gray-600":
                                variant === "secondary",

                            "bg-green-600":
                                variant === "success",

                            "bg-yellow-600":
                                variant === "warning",

                            "bg-red-600":
                                variant === "danger",

                            "bg-cyan-600":
                                variant === "info",
                        }
                    )}
                />
            )}

            {children}
        </span>
    );
}