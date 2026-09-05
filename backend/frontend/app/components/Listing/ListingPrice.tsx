"use client";

import { cn } from "@/app/lib/cn";

interface Props {
    price: number;
    originalPrice?: number;
    negotiable?: boolean;
    currency?: string;
}

export default function ListingPrice({
    price,
    originalPrice,
    negotiable = false,
    currency = "Lei",
}: Props) {
    const hasDiscount =
        originalPrice !== undefined &&
        originalPrice > price;

    const discount = hasDiscount
        ? Math.round(
              ((originalPrice - price) /
                  originalPrice) *
                  100
          )
        : 0;

    return (
        <div className="space-y-1">

            <div className="flex items-center gap-2">

                <span className="text-2xl font-bold tracking-tight text-emerald-600">
                    {price.toLocaleString("ro-RO")} {currency}
                </span>

                {negotiable && (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        Negociabil
                    </span>
                )}

            </div>

            {hasDiscount && (
                <div className="flex items-center gap-2">

                    <span className="text-sm text-gray-400 line-through">
                        {originalPrice.toLocaleString("ro-RO")} {currency}
                    </span>

                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-600">
                        -{discount}%
                    </span>

                </div>
            )}

        </div>
    );
}