"use client";

import { ReactNode } from "react";
import { cn } from "@/app/lib/cn";
import Tooltip from "../ui/Tooltip";

interface HeaderIconButtonProps {
    icon: ReactNode;
    tooltip: string;
    count?: number;
    active?: boolean;
    danger?: boolean;
    onClick?: () => void;
}

export default function HeaderIconButton({
    icon,
    tooltip,
    count = 0,
    active = false,
    danger = false,
    onClick,
}: HeaderIconButtonProps) {
    return (
        <Tooltip content={tooltip} position="bottom">
            <button
                onClick={onClick}
                className={cn(
                    "relative flex h-11 w-11 items-center justify-center rounded-2xl transition-all duration-200",

                    active
                        ? danger
                            ? "bg-red-50 text-red-600"
                            : "bg-blue-50 text-blue-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-black"
                )}
            >
                {icon}

                {count > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow">
                        {count > 99 ? "99+" : count}
                    </span>
                )}
            </button>
        </Tooltip>
    );
}