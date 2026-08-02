"use client";

import { ReactNode } from "react";
import clsx from "clsx";

import Button from "./Button";

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export default function EmptyState({
    icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={clsx(
                "flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-white px-8 py-16 text-center",
                className
            )}
        >
            {icon && (
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    {icon}
                </div>
            )}

            <h2 className="text-2xl font-bold text-gray-900">
                {title}
            </h2>

            {description && (
                <p className="mt-3 max-w-md text-gray-500">
                    {description}
                </p>
            )}

            {actionLabel && onAction && (
                <Button
                    className="mt-8"
                    onClick={onAction}
                >
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}