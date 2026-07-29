"use client";

import Link from "next/link";

interface Props {
    title: string;
    description: string;
    buttonLabel?: string;
    buttonHref?: string;
}

export default function EmptyState({
    title,
    description,
    buttonLabel,
    buttonHref,
}: Props) {
    return (
        <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-8 py-20 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5m-16.5 0v10.5A2.25 2.25 0 006 19.5h12a2.25 2.25 0 002.25-2.25V6.75M3.75 6.75l1.5-3h13.5l1.5 3"
                    />
                </svg>
            </div>

            <h2 className="mt-6 text-2xl font-semibold">
                {title}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-500">
                {description}
            </p>

            {buttonLabel && buttonHref && (
                <Link
                    href={buttonHref}
                    className="
                        mt-8
                        inline-flex
                        items-center
                        justify-center
                        rounded-xl
                        bg-black
                        px-6
                        py-3
                        text-sm
                        font-medium
                        text-white
                        transition
                        hover:opacity-90
                    "
                >
                    {buttonLabel}
                </Link>
            )}

        </div>
    );
}