"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [query, setQuery] = useState(
        searchParams.get("search") ?? ""
    );

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(
                searchParams.toString()
            );

            if (query.trim()) {
                params.set("search", query);
            } else {
                params.delete("search");
            }

            router.replace(
                `?${params.toString()}`,
                {
                    scroll: false,
                }
            );
        }, 400);

        return () => clearTimeout(timeout);
    }, [
        query,
        router,
        searchParams,
    ]);

    return (
        <div className="relative">

            <Search
                size={20}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
                value={query}
                onChange={(e) =>
                    setQuery(e.target.value)
                }
                placeholder="Search listings..."
                className="
                    h-14
                    w-full
                    rounded-2xl
                    border
                    border-gray-200
                    bg-white
                    pl-14
                    pr-12
                    text-base
                    shadow-sm
                    transition
                    focus:border-emerald-500
                    focus:outline-none
                    focus:ring-4
                    focus:ring-emerald-100
                "
            />

            {query && (

                <button
                    type="button"
                    onClick={() =>
                        setQuery("")
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
                >

                    <X
                        size={18}
                    />

                </button>

            )}

        </div>
    );
}