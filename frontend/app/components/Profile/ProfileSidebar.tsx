"use client";

import Image from "next/image";
import { CalendarDays, Mail, MapPin, ShieldCheck } from "lucide-react";

interface Props {
    user: {
        username: string;
        email: string;
        avatar?: string;
        city?: string;
        createdAt: string;
        verified?: boolean;
    };
}

export default function ProfileSidebar({
    user,
}: Props) {
    const memberSince = new Date(
        user.createdAt
    ).toLocaleDateString("ro-RO", {
        month: "long",
        year: "numeric",
    });

    return (
        <aside className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col items-center">

                <div className="relative h-28 w-28 overflow-hidden rounded-full bg-gray-100">

                    {user.avatar ? (
                        <Image
                            src={user.avatar}
                            alt={user.username}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-4xl font-bold text-gray-400">
                            {user.username.charAt(0)}
                        </div>
                    )}

                </div>

                <h2 className="mt-5 text-xl font-bold">
                    {user.username}
                </h2>

                {user.verified && (
                    <div className="mt-2 flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm text-green-700">
                        <ShieldCheck size={16} />
                        Utilizator verificat
                    </div>
                )}
            </div>

            <div className="mt-8 space-y-4">

                <div className="flex items-center gap-3 text-gray-600">
                    <Mail size={18} />
                    <span>{user.email}</span>
                </div>

                {user.city && (
                    <div className="flex items-center gap-3 text-gray-600">
                        <MapPin size={18} />
                        <span>{user.city}</span>
                    </div>
                )}

                <div className="flex items-center gap-3 text-gray-600">
                    <CalendarDays size={18} />
                    <span>Membru din {memberSince}</span>
                </div>

            </div>

            <div className="mt-8 border-t pt-6">

                <button
                    className="
                        w-full
                        rounded-xl
                        bg-black
                        py-3
                        font-medium
                        text-white
                        transition
                        hover:opacity-90
                    "
                >
                    Editează profilul
                </button>

            </div>

        </aside>
    );
}