"use client";

import Image from "next/image";
import Link from "next/link";

interface Props {
    user: {
        _id: string;
        username: string;
        email: string;
        avatar: string;
        createdAt: string;
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

    return (
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

            <div className="flex flex-col gap-6 md:flex-row md:items-center">

                <div className="relative h-28 w-28 overflow-hidden rounded-full border bg-gray-100">

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

                <div className="flex-1">

                    <h1 className="text-3xl font-bold">
                        {user.username}
                    </h1>

                    <p className="mt-1 text-gray-500">
                        {user.email}
                    </p>

                    <p className="mt-3 text-sm text-gray-400">
                        Membru din {memberSince}
                    </p>

                </div>

                <Link
                    href="/profile/edit"
                    className="
                        rounded-xl
                        border
                        px-6
                        py-3
                        font-medium
                        transition
                        hover:bg-gray-100
                    "
                >
                    Editează profilul
                </Link>

            </div>

        </section>
    );
}