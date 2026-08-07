"use client";

import {
    Tag,
    ShieldCheck,
    Truck,
    RefreshCcw,
} from "lucide-react";

interface Props {
    category?: string;
    condition?: string;
    negotiable?: boolean;
    shipping?: boolean;
}

export default function ProductTags({
    category,
    condition,
    negotiable,
    shipping,
}: Props) {
    const tags = [
        {
            show: !!category,
            label: category,
            icon: <Tag size={15} />,
            color:
                "bg-blue-100 text-blue-700",
        },
        {
            show: !!condition,
            label: condition,
            icon: (
                <ShieldCheck size={15} />
            ),
            color:
                "bg-emerald-100 text-emerald-700",
        },
        {
            show: negotiable,
            label: "Negotiable",
            icon: (
                <RefreshCcw size={15} />
            ),
            color:
                "bg-amber-100 text-amber-700",
        },
        {
            show: shipping,
            label: "Shipping Available",
            icon: (
                <Truck size={15} />
            ),
            color:
                "bg-violet-100 text-violet-700",
        },
    ].filter((tag) => tag.show);

    if (!tags.length) return null;

    return (
        <section className="flex flex-wrap gap-3">

            {tags.map((tag) => (
                <span
                    key={tag.label}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${tag.color}`}
                >
                    {tag.icon}

                    {tag.label}
                </span>
            ))}

        </section>
    );
}