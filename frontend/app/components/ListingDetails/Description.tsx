"use client";

import { FileText } from "lucide-react";

import { Listing } from "@/app/types/listing";

type DescriptionProps = {
    listing: Listing;
};

export default function Description({
    listing,
}: DescriptionProps) {
    return (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
                <FileText size={22} />

                <h2 className="text-xl font-bold">
                    Descriere
                </h2>
            </div>

            {listing.description ? (
                <p className="whitespace-pre-wrap break-words leading-7 text-gray-700">
                    {listing.description}
                </p>
            ) : (
                <p className="italic text-gray-400">
                    Vânzătorul nu a adăugat o descriere.
                </p>
            )}
        </section>
    );
}