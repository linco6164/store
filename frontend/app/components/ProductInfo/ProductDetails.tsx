"use client";

import {
    Package,
    Tag,
    ShieldCheck,
    Palette,
    Calendar,
    Box,
} from "lucide-react";

interface Props {
    specifications: {
        brand?: string;
        category?: string;
        condition?: string;
        color?: string;
        warranty?: string;
        year?: string | number;
    };
}

export default function ProductDetails({
    specifications,
}: Props) {
    const items = [
        {
            label: "Category",
            value: specifications.category,
            icon: <Tag size={18} />,
        },
        {
            label: "Condition",
            value: specifications.condition,
            icon: <Package size={18} />,
        },
        {
            label: "Brand",
            value: specifications.brand,
            icon: <Box size={18} />,
        },
        {
            label: "Color",
            value: specifications.color,
            icon: <Palette size={18} />,
        },
        {
            label: "Warranty",
            value: specifications.warranty,
            icon: <ShieldCheck size={18} />,
        },
        {
            label: "Year",
            value: specifications.year,
            icon: <Calendar size={18} />,
        },
    ].filter((item) => item.value);

    if (!items.length) return null;

    return (
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

            <h2 className="mb-8 text-2xl font-bold">
                Specifications
            </h2>

            <div className="grid gap-5 md:grid-cols-2">

                {items.map((item) => (

                    <div
                        key={item.label}
                        className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-emerald-200 hover:bg-white"
                    >

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">

                            {item.icon}

                        </div>

                        <div>

                            <p className="text-xs uppercase tracking-wide text-gray-500">

                                {item.label}

                            </p>

                            <p className="mt-1 font-semibold text-gray-900">

                                {item.value}

                            </p>

                        </div>

                    </div>

                ))}

            </div>

        </section>
    );
}