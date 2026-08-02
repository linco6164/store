"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/app/lib/cn";

interface CategoryCardProps {
    title: string;
    description?: string;
    icon: React.ReactNode;
    selected?: boolean;
    onClick?: () => void;
}

export default function CategoryCard({
    title,
    description,
    icon,
    selected = false,
    onClick,
}: CategoryCardProps) {
    return (
        <motion.button
            type="button"
            whileHover={{
                y: -4,
                scale: 1.02,
            }}
            whileTap={{
                scale: 0.98,
            }}
            onClick={onClick}
            className={cn(
                "relative w-full overflow-hidden rounded-3xl border p-6 text-left transition-all duration-300",

                selected
                    ? "border-emerald-500 bg-emerald-50 shadow-xl"
                    : "border-gray-200 bg-white hover:border-emerald-300 hover:shadow-lg"
            )}
        >
            {selected && (
                <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg">
                    <Check size={16} />
                </div>
            )}

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
                {icon}
            </div>

            <h3 className="text-lg font-bold text-gray-900">
                {title}
            </h3>

            {description && (
                <p className="mt-2 text-sm leading-6 text-gray-500">
                    {description}
                </p>
            )}
        </motion.button>
    );
}