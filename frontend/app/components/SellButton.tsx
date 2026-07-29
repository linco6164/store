"use client";

import Link from "next/link";
import { Plus } from "lucide-react";

export default function SellButton() {
  return (
    <Link
      href="/sell"
      className="flex items-center gap-2 rounded-full bg-green-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
    >
      <Plus size={18} />
      Vinde
    </Link>
  );
}