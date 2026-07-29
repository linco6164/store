"use client";

import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import Dropdown from "../Dropdown";

const conversations = [
  {
    id: 1,
    name: "Alex Popescu",
    avatar: "/default-avatar.png",
    message: "Mai este disponibil?",
    time: "2 min",
    unread: true,
  },
  {
    id: 2,
    name: "Maria Ionescu",
    avatar: "/default-avatar.png",
    message: "Mulțumesc!",
    time: "1 h",
    unread: false,
  },
];

export default function MessagesDropdown() {
  const unread = conversations.filter(c => c.unread).length;

  return (
    <Dropdown
      trigger={
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-100">
          <MessageCircle size={22} />

          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-600 px-1 text-[10px] font-semibold text-white">
              {unread}
            </span>
          )}
        </div>
      }
    >
      <div>
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">Mesaje</h3>
        </div>

        {conversations.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Nu ai mesaje.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {conversations.map((chat) => (
              <Link
                key={chat.id}
                href={`/messages/${chat.id}`}
                className="flex items-center gap-3 border-b px-4 py-3 transition hover:bg-gray-50"
              >
                <Image
                  src={chat.avatar}
                  alt={chat.name}
                  width={48}
                  height={48}
                  className="rounded-full"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {chat.name}
                    </span>

                    <span className="text-xs text-gray-400">
                      {chat.time}
                    </span>
                  </div>

                  <p className="truncate text-sm text-gray-500">
                    {chat.message}
                  </p>
                </div>

                {chat.unread && (
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                )}
              </Link>
            ))}
          </div>
        )}

        <Link
          href="/messages"
          className="block border-t px-4 py-3 text-center text-sm font-medium text-emerald-600 hover:bg-gray-50"
        >
          Vezi toate conversațiile
        </Link>
      </div>
    </Dropdown>
  );
}