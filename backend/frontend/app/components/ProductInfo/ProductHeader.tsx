"use client";

import {
    MapPin,
    Clock3,
    Eye,
    BadgeCheck,
} from "lucide-react";

interface Props {
    title: string;
    category: string;
    condition: string;
    city: string;
    views?: number;
    createdAt: string;
    verified?: boolean;
}

export default function ProductHeader({
    title,
    category,
    condition,
    city,
    views = 0,
    createdAt,
    verified = false,
}: Props) {
    return (
        <header className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

            <div className="flex flex-wrap items-center gap-3">

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">

                    {category}

                </span>

                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">

                    {condition}

                </span>

                {verified && (

                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700">

                        <BadgeCheck size={16} />

                        Verified

                    </span>

                )}

            </div>

            <h1 className="mt-5 text-4xl font-black leading-tight text-gray-900">

                {title}

            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-6 text-sm text-gray-500">

                <div className="flex items-center gap-2">

                    <MapPin size={17} />

                    {city}

                </div>

                <div className="flex items-center gap-2">

                    <Clock3 size={17} />

                    {createdAt}

                </div>

                <div className="flex items-center gap-2">

                    <Eye size={17} />

                    {views.toLocaleString()} views

                </div>

            </div>

        </header>
    );
}