"use client";

import Link from "next/link";
import { Heart } from "lucide-react";

export default function FavoritesButton() {
  return (
    <Link
      href="/favorites"
      className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition"
    >
      <Heart size={22} />

      <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-semibold text-white">
        0
      </span>
    </Link>
  );
}