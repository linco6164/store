"use client";

import Link from "next/link";
import clsx from "clsx";
import { ReactNode } from "react";

interface DropdownItemProps {
    icon?: ReactNode;
    children: ReactNode;
    danger?: boolean;
    onClick?: () => void;
    href?: string;
}

export default function DropdownItem({
    icon,
    children,
    danger = false,
    onClick,
    href,
}: DropdownItemProps) {
    const className = clsx(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left",
        "text-sm font-medium transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-300",
        danger
            ? [
                  "text-red-600",
                  "hover:bg-red-50",
                  "hover:text-red-700",
              ]
            : [
                  "text-gray-700",
                  "hover:bg-gray-50",
                  "hover:text-gray-900",
              ]
    );

    const content = (
        <>
            {icon && (
                <span
                    className={clsx(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        "transition-all duration-150",
                        danger
                            ? [
                                  "bg-red-50",
                                  "text-red-500",
                                  "group-hover:bg-red-100",
                                  "group-hover:text-red-600",
                              ]
                            : [
                                  "bg-gray-100",
                                  "text-gray-500",
                                  "group-hover:bg-white",
                                  "group-hover:text-gray-900",
                                  "group-hover:shadow-sm",
                              ]
                    )}
                >
                    {icon}
                </span>
            )}

            <span className="min-w-0 flex-1 truncate">
                {children}
            </span>
        </>
    );

    if (href) {
        return (
            <Link
                href={href}
                className={className}
            >
                {content}
            </Link>
        );
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={className}
        >
            {content}
        </button>
    );
}