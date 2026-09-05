"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { cn } from "@/app/lib/cn";

interface SellButtonProps {
    mobile?: boolean;
}

export default function SellButton({
    mobile = false,
}: SellButtonProps) {
    return (
        <Link
            href="/sell"
            className={cn(
                "group inline-flex items-center justify-center rounded-2xl font-semibold text-white transition-all duration-300",

                "bg-gradient-to-r from-emerald-500 to-emerald-600",

                "shadow-lg shadow-emerald-500/20",

                "hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30",

                mobile
                    ? "h-11 w-11"
                    : "h-11 gap-2 px-5"
            )}
        >
            <Plus
                size={18}
                className="transition-transform duration-300 group-hover:rotate-90"
            />

            {!mobile && (
                <span>Sell now</span>
            )}
        </Link>
    );
}