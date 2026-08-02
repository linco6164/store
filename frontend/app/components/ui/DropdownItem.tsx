"use client";

import clsx from "clsx";
import { ReactNode } from "react";

interface DropdownItemProps {
    icon?: ReactNode;
    children: ReactNode;
    danger?: boolean;
    onClick?: () => void;
}

export default function DropdownItem({
    icon,
    children,
    danger,
    onClick,
}: DropdownItemProps) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "flex w-full items-center gap-3 px-4 py-3 text-left transition",

                danger
                    ? "text-red-600 hover:bg-red-50"
                    : "hover:bg-gray-50"
            )}
        >
            {icon}

            <span className="text-sm font-medium">
                {children}
            </span>
        </button>
    );
}