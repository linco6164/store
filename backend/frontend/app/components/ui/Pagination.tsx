"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
}

export default function Pagination({
    page,
    totalPages,
    onChange,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    function generatePages() {
        const pages: (number | "...")[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }

            return pages;
        }

        pages.push(1);

        if (page > 3) {
            pages.push("...");
        }

        const start = Math.max(2, page - 1);
        const end = Math.min(
            totalPages - 1,
            page + 1
        );

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (page < totalPages - 2) {
            pages.push("...");
        }

        pages.push(totalPages);

        return pages;
    }

    return (
        <div className="flex items-center justify-center gap-2">

            <button
                disabled={page === 1}
                onClick={() =>
                    onChange(page - 1)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <ChevronLeft size={18} />
            </button>

            {generatePages().map((item, index) =>
                item === "..." ? (
                    <span
                        key={index}
                        className="px-2 text-gray-400"
                    >
                        ...
                    </span>
                ) : (
                    <button
                        key={item}
                        onClick={() =>
                            onChange(item)
                        }
                        className={clsx(
                            "flex h-10 min-w-[40px] items-center justify-center rounded-xl px-3 font-medium transition",

                            page === item
                                ? "bg-blue-600 text-white shadow"
                                : "border border-gray-200 bg-white hover:bg-gray-100"
                        )}
                    >
                        {item}
                    </button>
                )
            )}

            <button
                disabled={page === totalPages}
                onClick={() =>
                    onChange(page + 1)
                }
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <ChevronRight size={18} />
            </button>

        </div>
    );
}