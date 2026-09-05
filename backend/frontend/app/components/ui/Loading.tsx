"use client";

import { LoaderCircle } from "lucide-react";
import { cn } from "@/app/lib/cn";

interface LoadingProps {
    size?: "sm" | "md" | "lg";
    label?: string;
    className?: string;
    fullscreen?: boolean;
}

const sizes = {
    sm: {
        icon: 16,
        text: "text-xs",
        gap: "gap-2",
    },
    md: {
        icon: 22,
        text: "text-sm",
        gap: "gap-2.5",
    },
    lg: {
        icon: 30,
        text: "text-sm",
        gap: "gap-3",
    },
};

export default function Loading({
    size = "md",
    label,
    className,
    fullscreen = false,
}: LoadingProps) {
    const current = sizes[size];

    const content = (
        <div
            className={cn(
                "flex flex-col items-center justify-center",
                current.gap,
                className
            )}
        >
            <LoaderCircle
                size={current.icon}
                strokeWidth={2}
                className="animate-spin text-gray-900"
            />

            {label && (
                <span
                    className={cn(
                        "font-medium text-gray-500",
                        current.text
                    )}
                >
                    {label}
                </span>
            )}
        </div>
    );

    if (fullscreen) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
                {content}
            </div>
        );
    }

    return content;
}