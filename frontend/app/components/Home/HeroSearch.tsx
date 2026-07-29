"use client";

import { Search } from "lucide-react";

export default function HeroSearch() {
    return (
        <form className="mx-auto mt-8 flex w-full max-w-2xl items-center rounded-full border bg-white px-4 py-3 shadow-sm transition focus-within:ring-2 focus-within:ring-emerald-500">
            <Search className="mr-3 h-5 w-5 text-gray-400" />

            <input
                type="text"
                placeholder="Caută produse..."
                className="flex-1 bg-transparent outline-none"
            />

            <button
                type="submit"
                className="rounded-full bg-emerald-500 px-6 py-2 font-medium text-white transition hover:bg-emerald-600"
            >
                Caută
            </button>
        </form>
    );
}