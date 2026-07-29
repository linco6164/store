"use client";

import { Search } from "lucide-react";
import { useState } from "react";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    if (!query.trim()) return;

    window.location.href = `/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <div className="relative w-full max-w-2xl">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        size={18}
      />

      <input
        type="text"
        placeholder="Caută articole, branduri..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSearch();
        }}
        className="
          h-11
          w-full
          rounded-full
          border
          border-gray-200
          bg-gray-50
          pl-11
          pr-4
          text-sm
          outline-none
          transition
          focus:border-green-500
          focus:bg-white
        "
      />
    </div>
  );
}