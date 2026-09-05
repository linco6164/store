"use client";

import { ReactNode } from "react";
import { cn } from "@/app/lib/cn";

interface PageProps {
    children: ReactNode;
    className?: string;
}

export default function Page({
    children,
    className,
}: PageProps) {
    return (
        <main
            className={cn(
                "min-h-screen bg-gray-50",
                className
            )}
        >
            {children}
        </main>
    );
}