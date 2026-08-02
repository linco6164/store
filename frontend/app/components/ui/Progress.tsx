"use client";

import clsx from "clsx";

interface ProgressProps {
    value: number;
    max?: number;
    showValue?: boolean;
    size?: "sm" | "md" | "lg";
    color?: "primary" | "success" | "warning" | "danger";
    animated?: boolean;
    className?: string;
}

const heights = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4",
};

const colors = {
    primary: "bg-blue-600",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    danger: "bg-red-500",
};

export default function Progress({
    value,
    max = 100,
    showValue = false,
    size = "md",
    color = "primary",
    animated = true,
    className,
}: ProgressProps) {
    const percentage = Math.min(
        100,
        Math.max(0, (value / max) * 100)
    );

    return (
        <div className={clsx("w-full", className)}>

            <div
                className={clsx(
                    "overflow-hidden rounded-full bg-gray-200",
                    heights[size]
                )}
            >
                <div
                    className={clsx(
                        "h-full rounded-full",
                        colors[color],
                        animated &&
                            "transition-all duration-500 ease-out"
                    )}
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>

            {showValue && (
                <div className="mt-2 flex justify-between text-sm text-gray-500">

                    <span>
                        {Math.round(percentage)}%
                    </span>

                    <span>
                        {value}/{max}
                    </span>

                </div>
            )}

        </div>
    );
}