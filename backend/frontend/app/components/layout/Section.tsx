"use client";

import { ReactNode } from "react";
import { cn } from "@/app/lib/cn";

interface SectionProps {
    children: ReactNode;
    className?: string;
}

export default function Section({
    children,
    className,
}: SectionProps) {
    return (
        <section
            className={cn(
                "py-8 md:py-10 lg:py-12",
                className
            )}
        >
            {children}
        </section>
    );
}