"use client";

import { useEffect, useRef, useState } from "react";

import { Search, X } from "lucide-react";
import { cn } from "@/app/lib/cn";

export default function SearchBar() {
    const [query, setQuery] = useState("");

    const [focused, setFocused] =
        useState(false);

    const wrapperRef =
        useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(
            e: MouseEvent
        ) {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(
                    e.target as Node
                )
            ) {
                setFocused(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClick
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClick
            );
    }, []);

    return (
        <div
            ref={wrapperRef}
            className="relative w-full"
        >
            <div
                className={cn(
                    "flex h-12 items-center rounded-2xl border bg-gray-50 transition-all",

                    focused
                        ? "border-blue-500 bg-white shadow-lg ring-4 ring-blue-100"
                        : "border-gray-200 hover:border-gray-300"
                )}
            >
                <Search
                    className="ml-4 text-gray-400"
                    size={20}
                />

                <input
                    value={query}
                    onFocus={() =>
                        setFocused(true)
                    }
                    onChange={(e) =>
                        setQuery(
                            e.target.value
                        )
                    }
                    placeholder="Search products..."
                    className="h-full flex-1 bg-transparent px-3 text-[15px] outline-none placeholder:text-gray-400"
                />

                {query.length > 0 && (
                    <button
                        onClick={() =>
                            setQuery("")
                        }
                        className="mr-3 rounded-lg p-1 hover:bg-gray-100"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {focused && (
                <div className="absolute mt-3 w-full rounded-2xl border bg-white p-4 shadow-2xl">

                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                        Recent Searches
                    </p>

                    <div className="space-y-2">

                        <button className="flex w-full rounded-xl px-3 py-2 text-left transition hover:bg-gray-100">
                            Nike Air Force
                        </button>

                        <button className="flex w-full rounded-xl px-3 py-2 text-left transition hover:bg-gray-100">
                            iPhone 15
                        </button>

                        <button className="flex w-full rounded-xl px-3 py-2 text-left transition hover:bg-gray-100">
                            Playstation 5
                        </button>

                    </div>

                </div>
            )}
        </div>
    );
}