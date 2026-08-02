"use client";

import { ReactNode } from "react";
import { cn } from "@/app/lib/cn";

interface StackProps {
    children: ReactNode;
    className?: string;
    gap?: "sm" | "md" | "lg" | "xl";
}

const gaps = {
    sm: "space-y-2",
    md: "space-y-4",
    lg: "space-y-6",
    xl: "space-y-8",
};

export default function Stack({
    children,
    className,
    gap = "md",
}: StackProps) {
    return (
        <div
            className={cn(
                gaps[gap],
                className
            )}
        >
            {children}
        </div>
    );
}