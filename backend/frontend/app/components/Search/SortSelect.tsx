"use client";

import { ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const options = [
    {
        value: "newest",
        label: "Newest",
    },
    {
        value: "oldest",
        label: "Oldest",
    },
    {
        value: "price_asc",
        label: "Price: Low → High",
    },
    {
        value: "price_desc",
        label: "Price: High → Low",
    },
    {
        value: "views",
        label: "Most Viewed",
    },
    {
        value: "favorites",
        label: "Most Favorited",
    },
];

export default function SortSelect() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const selected =
        searchParams.get("sort") ??
        "newest";

    function handleChange(
        e: React.ChangeEvent<HTMLSelectElement>
    ) {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        params.set(
            "sort",
            e.target.value
        );

        router.replace(
            `?${params.toString()}`,
            {
                scroll: false,
            }
        );
    }

    return (
        <div className="space-y-2">

            <label className="text-sm font-medium text-gray-600">
                Sort By
            </label>

            <div className="relative">

                <ArrowUpDown
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                    value={selected}
                    onChange={handleChange}
                    className="
                        h-12
                        w-full
                        appearance-none
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        pl-11
                        pr-10
                        text-sm
                        shadow-sm
                        transition
                        focus:border-emerald-500
                        focus:outline-none
                        focus:ring-4
                        focus:ring-emerald-100
                    "
                >

                    {options.map((option) => (

                        <option
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </option>

                    ))}

                </select>

            </div>

        </div>
    );
}