"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

export default function NotificationsButton() {
  return (
    <Link
      href="/notifications"
      className="relative flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100 transition"
    >
      <Bell size={22} />

      <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
        0
      </span>
    </Link>
  );
}