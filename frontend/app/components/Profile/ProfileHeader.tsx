"use client";

import Image from "next/image";
import Link from "next/link";

import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Mail,
    MapPin,
    Pencil,
    ShieldCheck,
} from "lucide-react";

interface Props {
    user: {
        _id: string;
        username: string;
        email: string;
        avatar: string;
        createdAt: string;
        fullName?: string;
        city?: string;
        county?: string;
        bio?: string;
        verified?: boolean;
    };
}

export default function ProfileHeader({
    user,
}: Props) {
    const memberSince = new Date(
        user.createdAt
    ).toLocaleDateString("ro-RO", {
        month: "long",
        year: "numeric",
    });

    const initials =
        user.username
            ?.slice(0, 1)
            .toUpperCase() || "U";

    return (
        <section className="relative overflow-hidden bg-white">
            {/* Decorative background */}

            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-gray-100 via-white to-blue-50" />

            <div className="absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-100/40 blur-3xl" />

            <div className="absolute -left-20 top-20 h-40 w-40 rounded-full bg-purple-100/30 blur-3xl" />

            <div className="relative px-5 pb-7 pt-6 sm:px-8 sm:pb-8 lg:px-10">

                {/* Top action */}

                <div className="mb-8 flex justify-end">
                    <Link
                        href="/profile/edit"
                        className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
                    >
                        <Pencil
                            size={16}
                            className="transition-transform group-hover:-rotate-6"
                        />

                        Editează profilul
                    </Link>
                </div>

                {/* Main */}

                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

                    {/* Avatar */}

                    <div className="relative shrink-0">
                        <div className="relative h-28 w-28 overflow-hidden rounded-[2rem] border-4 border-white bg-gray-100 shadow-lg sm:h-32 sm:w-32">
                            {user.avatar ? (
                                <Image
                                    src={user.avatar}
                                    alt={user.username}
                                    fill
                                    sizes="128px"
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-4xl font-bold text-gray-400">
                                    {initials}
                                </div>
                            )}
                        </div>

                        {user.verified && (
                            <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-blue-600 text-white shadow-sm">
                                <CheckCircle2
                                    size={17}
                                    fill="currentColor"
                                    className="text-white"
                                />
                            </div>
                        )}
                    </div>

                    {/* User information */}

                    <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
                                {user.fullName ||
                                    user.username}
                            </h1>

                            {user.verified && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">
                                    <ShieldCheck
                                        size={14}
                                    />

                                    Verified
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-sm font-medium text-gray-500">
                            @{user.username}
                        </p>

                        {/* Meta */}

                        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">

                            <div className="flex items-center gap-1.5">
                                <Mail
                                    size={15}
                                    className="text-gray-400"
                                />

                                <span className="truncate">
                                    {user.email}
                                </span>
                            </div>

                            {(user.city ||
                                user.county) && (
                                <div className="flex items-center gap-1.5">
                                    <MapPin
                                        size={15}
                                        className="text-gray-400"
                                    />

                                    <span>
                                        {[
                                            user.city,
                                            user.county,
                                        ]
                                            .filter(Boolean)
                                            .join(
                                                ", "
                                            )}
                                    </span>
                                </div>
                            )}

                            <div className="flex items-center gap-1.5">
                                <CalendarDays
                                    size={15}
                                    className="text-gray-400"
                                />

                                <span>
                                    Membru din{" "}
                                    {memberSince}
                                </span>
                            </div>

                        </div>

                        {/* Bio */}

                        {user.bio && (
                            <p className="mt-5 max-w-2xl text-sm leading-6 text-gray-600">
                                {user.bio}
                            </p>
                        )}

                    </div>
                </div>

                {/* Profile action */}

                <div className="mt-7 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <p className="text-sm font-semibold text-gray-900">
                            Profilul tău
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                            Gestionează informațiile și
                            anunțurile tale.
                        </p>
                    </div>

                    <Link
                        href="/profile/edit"
                        className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
                    >
                        Gestionează profilul

                        <ChevronRight
                            size={16}
                            className="transition-transform group-hover:translate-x-0.5"
                        />
                    </Link>

                </div>

            </div>
        </section>
    );
}