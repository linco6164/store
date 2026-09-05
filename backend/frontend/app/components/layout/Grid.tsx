"use client";

import { ReactNode } from "react";
import { cn } from "@/app/lib/cn";

interface GridProps {
    children: ReactNode;
    className?: string;
    cols?: 2 | 3 | 4 | 5 | 6;
}

const columns = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
};

export default function Grid({
    children,
    className,
    cols = 4,
}: GridProps) {
    return (
        <div
            className={cn(
                "grid gap-6",
                columns[cols],
                className
            )}
        >
            {children}
        </div>
    );
}