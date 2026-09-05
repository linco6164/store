"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function PriceFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const minPrice =
        searchParams.get("minPrice") ?? "";

    const maxPrice =
        searchParams.get("maxPrice") ?? "";

    function update(
        key: "minPrice" | "maxPrice",
        value: string
    ) {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
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
                Price
            </label>

            <div className="grid grid-cols-2 gap-2">

                <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    min={0}
                    onChange={(e) =>
                        update(
                            "minPrice",
                            e.target.value
                        )
                    }
                    className="
                        h-12
                        rounded-2xl
                        border
                        border-gray-200
                        px-3
                        text-sm
                        transition
                        focus:border-emerald-500
                        focus:outline-none
                        focus:ring-4
                        focus:ring-emerald-100
                    "
                />

                <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    min={0}
                    onChange={(e) =>
                        update(
                            "maxPrice",
                            e.target.value
                        )
                    }
                    className="
                        h-12
                        rounded-2xl
                        border
                        border-gray-200
                        px-3
                        text-sm
                        transition
                        focus:border-emerald-500
                        focus:outline-none
                        focus:ring-4
                        focus:ring-emerald-100
                    "
                />

            </div>

        </div>
    );
}