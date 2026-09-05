"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Search,
    X,
} from "lucide-react";

import {
    useRouter,
    useSearchParams,
} from "next/navigation";

import { cn } from "@/app/lib/cn";

const recentSearches = [
    "Nike Air Force",
    "iPhone 15",
    "PlayStation 5",
];

export default function SearchBar() {
    const router = useRouter();
    const searchParams =
        useSearchParams();

    const wrapperRef =
        useRef<HTMLDivElement>(null);

    const [focused, setFocused] =
        useState(false);

    const [query, setQuery] =
        useState(
            searchParams.get("search") ??
                ""
        );

    useEffect(() => {
        const timeout =
            setTimeout(() => {
                const params =
                    new URLSearchParams(
                        searchParams.toString()
                    );

                if (query.trim()) {
                    params.set(
                        "search",
                        query
                    );
                } else {
                    params.delete(
                        "search"
                    );
                }

                router.replace(
                    `?${params.toString()}`,
                    {
                        scroll: false,
                    }
                );
            }, 400);

        return () =>
            clearTimeout(timeout);
    }, [
        query,
        router,
        searchParams,
    ]);

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
                    "flex h-12 items-center rounded-2xl border bg-gray-50 transition-all duration-200",
                    focused
                        ? "border-emerald-500 bg-white shadow-lg ring-4 ring-emerald-100"
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
                    placeholder="Search listings..."
                    className="h-full flex-1 bg-transparent px-3 text-[15px] outline-none placeholder:text-gray-400"
                />

                {query && (
                    <button
                        type="button"
                        onClick={() =>
                            setQuery("")
                        }
                        className="mr-3 rounded-lg p-1 transition hover:bg-gray-100"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {focused && (
                <div className="absolute left-0 right-0 z-50 mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

                    <div className="border-b px-5 py-3">

                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">

                            Recent Searches

                        </p>

                    </div>

                    <div className="p-2">

                        {recentSearches.map(
                            (item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => {
                                        setQuery(
                                            item
                                        );
                                        setFocused(
                                            false
                                        );
                                    }}
                                    className="flex w-full items-center rounded-xl px-3 py-3 text-left text-sm transition hover:bg-gray-100"
                                >
                                    <Search
                                        size={
                                            16
                                        }
                                        className="mr-3 text-gray-400"
                                    />

                                    {item}
                                </button>
                            )
                        )}

                    </div>

                </div>
            )}
        </div>
    );
}