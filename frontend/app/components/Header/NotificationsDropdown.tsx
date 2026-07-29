"use client";

import Link from "next/link";
import { Bell, Heart, MessageCircle, Package, Star } from "lucide-react";
import Dropdown from "../Dropdown";

const notifications = [
  {
    id: 1,
    type: "favorite",
    title: "Produs adăugat la favorite",
    description: "Un utilizator a adăugat produsul tău la favorite.",
    time: "2 min",
    unread: true,
  },
  {
    id: 2,
    type: "message",
    title: "Mesaj nou",
    description: "Ai primit un mesaj nou.",
    time: "10 min",
    unread: true,
  },
  {
    id: 3,
    type: "shipping",
    title: "Comandă expediată",
    description: "Expedierea a fost preluată de curier.",
    time: "1 h",
    unread: false,
  },
];

function NotificationIcon({ type }: { type: string }) {
  switch (type) {
    case "favorite":
      return <Heart size={18} className="text-red-500" />;

    case "message":
      return <MessageCircle size={18} className="text-emerald-600" />;

    case "shipping":
      return <Package size={18} className="text-blue-600" />;

    case "review":
      return <Star size={18} className="text-yellow-500" />;

    default:
      return <Bell size={18} />;
  }
}

export default function NotificationsDropdown() {
  const unread = notifications.filter(n => n.unread).length;

  return (
    <Dropdown
      width="w-96"
      trigger={
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-gray-100">
          <Bell size={22} />

          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-semibold text-white">
              {unread}
            </span>
          )}
        </div>
      }
    >
      <div>

        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">
            Notificări
          </h3>

          <button className="text-xs text-emerald-600 hover:underline">
            Marchează toate ca citite
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Nu ai notificări.
          </div>
        ) : (
          <div className="max-h-[420px] overflow-y-auto">

            {notifications.map((notification) => (
              <Link
                key={notification.id}
                href="/notifications"
                className={`flex gap-3 border-b px-4 py-3 transition hover:bg-gray-50 ${
                  notification.unread ? "bg-blue-50/40" : ""
                }`}
              >
                <div className="mt-1">
                  <NotificationIcon type={notification.type} />
                </div>

                <div className="min-w-0 flex-1">

                  <div className="flex items-center justify-between">

                    <h4 className="text-sm font-semibold">
                      {notification.title}
                    </h4>

                    <span className="text-xs text-gray-400">
                      {notification.time}
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    {notification.description}
                  </p>

                </div>

                {notification.unread && (
                  <div className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-600" />
                )}

              </Link>
            ))}

          </div>
        )}

        <Link
          href="/notifications"
          className="block border-t px-4 py-3 text-center text-sm font-medium text-emerald-600 hover:bg-gray-50"
        >
          Vezi toate notificările
        </Link>

      </div>
    </Dropdown>
  );
}