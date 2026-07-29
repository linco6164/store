"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageCircle, User } from "lucide-react";

import { Listing } from "@/app/types/listing";

type SellerCardProps = {
    listing: Listing;
};

export default function SellerCard({
    listing,
}: SellerCardProps) {
    return (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-bold">
                Vânzător
            </h2>

            <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 overflow-hidden rounded-full border">
                    {listing.seller.avatar ? (
                        <Image
                            src={listing.seller.avatar}
                            alt={listing.seller.username}
                            fill
                            className="object-cover"
                            sizes="64px"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100">
                            <User className="text-gray-500" size={28} />
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    <h3 className="text-lg font-semibold">
                        {listing.seller.username}
                    </h3>

                    <p className="text-sm text-gray-500">
                        Membru Nexora
                    </p>
                </div>
            </div>

            <div className="mt-6 space-y-3">
                <Link
                    href={`/profile/${listing.seller._id}`}
                    className="block w-full rounded-xl border px-5 py-3 text-center font-medium transition hover:bg-gray-50"
                >
                    Vezi profilul
                </Link>

                <button
                    type="button"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 font-medium text-white transition hover:opacity-90"
                >
                    <MessageCircle size={20} />

                    Trimite mesaj
                </button>
            </div>
        </section>
    );
}