"use client";

import { useRouter, useSearchParams } from "next/navigation";

const categories = [
    "All",
    "Fashion",
    "Electronics",
    "Home",
    "Beauty",
    "Sports",
    "Kids",
    "Pets",
    "Vehicles",
];

export default function CategoryFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const selected =
        searchParams.get("category") ?? "All";

    function handleChange(
        e: React.ChangeEvent<HTMLSelectElement>
    ) {
        const value = e.target.value;

        const params = new URLSearchParams(
            searchParams.toString()
        );

        if (value === "All") {
            params.delete("category");
        } else {
            params.set("category", value);
        }

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
                Category
            </label>

            <select
                value={selected}
                onChange={handleChange}
                className="
                    h-12
                    w-full
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    px-4
                    text-sm
                    transition
                    focus:border-emerald-500
                    focus:outline-none
                    focus:ring-4
                    focus:ring-emerald-100
                "
            >
                {categories.map((category) => (
                    <option
                        key={category}
                        value={category}
                    >
                        {category}
                    </option>
                ))}
            </select>

        </div>
    );
}