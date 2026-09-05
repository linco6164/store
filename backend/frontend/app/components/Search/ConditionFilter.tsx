"use client";

import { useRouter, useSearchParams } from "next/navigation";

const conditions = [
    {
        value: "",
        label: "All Conditions",
    },
    {
        value: "new",
        label: "New",
    },
    {
        value: "like_new",
        label: "Like New",
    },
    {
        value: "good",
        label: "Good",
    },
    {
        value: "fair",
        label: "Fair",
    },
];

export default function ConditionFilter() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const selected =
        searchParams.get("condition") ?? "";

    function handleChange(
        e: React.ChangeEvent<HTMLSelectElement>
    ) {
        const params = new URLSearchParams(
            searchParams.toString()
        );

        if (e.target.value) {
            params.set(
                "condition",
                e.target.value
            );
        } else {
            params.delete("condition");
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
                Condition
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

                {conditions.map((condition) => (

                    <option
                        key={condition.value}
                        value={condition.value}
                    >

                        {condition.label}

                    </option>

                ))}

            </select>

        </div>
    );
}