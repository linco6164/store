"use client";

import { Heart, MessageCircle, ShoppingBag, Share2 } from "lucide-react";

import { Listing } from "@/app/types/listing";
import ContactSellerButton from "../Chat/ContactSellerButton";

type ActionsProps = {
    listing: Listing;
};

export default function Actions({
    listing,
}: ActionsProps) {
    const handleFavorite = () => {
        console.log("Favorite:", listing._id);
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: listing.title,
                    text: listing.title,
                    url: window.location.href,
                });

                return;
            } catch {
                return;
            }
        }

        await navigator.clipboard.writeText(window.location.href);

        alert("Link-ul a fost copiat.");
    };

    return (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="space-y-3">
                <button
                    type="button"
                    onClick={handleFavorite}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border px-5 py-4 font-semibold transition hover:bg-gray-50"
                >
                    <Heart size={22} />

                    Adaugă la favorite
                </button>

                <button
                    type="button"
                    className="flex w-full items-center justify-center gap-3 rounded-2xl bg-black px-5 py-4 font-semibold text-white transition hover:opacity-90"
                >
                    <ShoppingBag size={22} />

                    Cumpără acum
                </button>

                <ContactSellerButton
                    listingId={listing._id}
                />

                <button
                    type="button"
                    onClick={handleShare}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border px-5 py-4 font-semibold transition hover:bg-gray-50"
                >
                    <Share2 size={22} />

                    Distribuie anunțul
                </button>
            </div>
        </section>
    );
}