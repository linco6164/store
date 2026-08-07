"use client";

import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ActiveFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const filters = [
        {
            key: "search",
            label: searchParams.get("search"),
        },
        {
            key: "category",
            label: searchParams.get("category"),
        },
        {
            key: "condition",
            label: searchParams.get("condition"),
        },
        {
            key: "city",
            label: searchParams.get("city"),
        },
        {
            key: "minPrice",
            label: searchParams.get("minPrice")
                ? `Min ${searchParams.get("minPrice")} Lei`
                : null,
        },
        {
            key: "maxPrice",
            label: searchParams.get("maxPrice")
                ? `Max ${searchParams.get("maxPrice")} Lei`
                : null,
        },
        {
            key: "sort",
            label: searchParams.get("sort"),
        },
    ].filter(
        (
            item
        ): item is {
            key: string;
            label: string;
        } => Boolean(item.label)
    );

    if (!filters.length) {
        return null;
    }

    function removeFilter(key: string) {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        params.delete(key);

        router.replace(
            `?${params.toString()}`,
            {
                scroll: false,
            }
        );
    }

    function clearAll() {
        router.replace("?", {
            scroll: false,
        });
    }

    return (
        <section className="flex flex-wrap items-center gap-3">

            {filters.map((filter) => (

                <button
                    key={filter.key}
                    onClick={() =>
                        removeFilter(filter.key)
                    }
                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-full
                        border
                        border-emerald-200
                        bg-emerald-50
                        px-4
                        py-2
                        text-sm
                        font-medium
                        text-emerald-700
                        transition
                        hover:bg-emerald-100
                    "
                >
                    {filter.label}

                    <X size={15} />

                </button>

            ))}

            <button
                onClick={clearAll}
                className="
                    rounded-full
                    px-4
                    py-2
                    text-sm
                    font-semibold
                    text-red-500
                    transition
                    hover:bg-red-50
                "
            >
                Clear all
            </button>

        </section>
    );
}