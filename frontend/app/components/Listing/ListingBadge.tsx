"use client";

import { Sparkles, ShieldCheck, Truck, Flame } from "lucide-react";
import { cn } from "@/app/lib/cn";

interface Props {
    condition?: string;
    featured?: boolean;
    verified?: boolean;
    freeShipping?: boolean;
    popular?: boolean;
}

export default function ListingBadge({
    condition,
    featured,
    verified,
    freeShipping,
    popular,
}: Props) {
    return (
        <div className="absolute left-3 top-3 z-20 flex flex-col gap-2">

            {featured && (
                <Badge
                    color="yellow"
                    icon={<Sparkles size={12} />}
                >
                    Promovat
                </Badge>
            )}

            {verified && (
                <Badge
                    color="blue"
                    icon={<ShieldCheck size={12} />}
                >
                    Verificat
                </Badge>
            )}

            {freeShipping && (
                <Badge
                    color="emerald"
                    icon={<Truck size={12} />}
                >
                    Livrare Gratuită
                </Badge>
            )}

            {popular && (
                <Badge
                    color="red"
                    icon={<Flame size={12} />}
                >
                    Popular
                </Badge>
            )}

            {condition && (
                <Badge color="gray">
                    {condition}
                </Badge>
            )}

        </div>
    );
}

interface BadgeProps {
    children: React.ReactNode;
    icon?: React.ReactNode;
    color:
        | "gray"
        | "blue"
        | "emerald"
        | "yellow"
        | "red";
}

function Badge({
    children,
    icon,
    color,
}: BadgeProps) {
    const colors = {
        gray: "bg-white/90 text-gray-700",
        blue: "bg-blue-600 text-white",
        emerald:
            "bg-emerald-600 text-white",
        yellow:
            "bg-yellow-500 text-white",
        red: "bg-red-500 text-white",
    };

    return (
        <span
            className={cn(
                "inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow-md backdrop-blur-md",
                colors[color]
            )}
        >
            {icon}

            {children}
        </span>
    );
}