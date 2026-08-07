"use client";

import { Tag } from "lucide-react";

interface Props {
    price: number;
    negotiable?: boolean;
}

export default function ProductPrice({
    price,
    negotiable = false,
}: Props) {
    return (
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-6">

            <div className="flex items-center gap-2">

                <Tag
                    size={18}
                    className="text-emerald-600"
                />

                <span className="text-sm font-medium text-gray-500">
                    Price
                </span>

            </div>

            <h2 className="mt-3 text-4xl font-black tracking-tight text-gray-900">

                {price.toLocaleString("ro-RO")} Lei

            </h2>

            {negotiable && (

                <span className="mt-4 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">

                    Negotiable

                </span>

            )}

        </div>
    );
}