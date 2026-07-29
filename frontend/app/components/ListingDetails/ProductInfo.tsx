"use client";

import {
    Eye,
    MapPin,
    Tag,
    Package,
    Calendar,
} from "lucide-react";

import { Listing } from "@/app/types/listing";

type ProductInfoProps = {
    listing: Listing;
};

export default function ProductInfo({
    listing,
}: ProductInfoProps) {
    return (
        <section className="rounded-3xl border bg-white p-6 shadow-sm">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold">
                    {listing.title}
                </h1>

                <p className="text-4xl font-bold text-emerald-600">
                    {listing.price.toLocaleString("ro-RO")} lei
                </p>
            </div>

            <div className="mt-8 grid gap-4">
                <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Tag size={20} />
                        <span>Categorie</span>
                    </div>

                    <span className="font-semibold capitalize">
                        {listing.category}
                    </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Package size={20} />
                        <span>Stare</span>
                    </div>

                    <span className="font-semibold capitalize">
                        {listing.condition}
                    </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <MapPin size={20} />
                        <span>Oraș</span>
                    </div>

                    <span className="font-semibold">
                        {listing.city}
                    </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Eye size={20} />
                        <span>Vizualizări</span>
                    </div>

                    <span className="font-semibold">
                        {listing.views ?? 0}
                    </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                    <div className="flex items-center gap-3">
                        <Calendar size={20} />
                        <span>Publicat</span>
                    </div>

                    <span className="font-semibold">
                        {listing.createdAt
                            ? new Date(
                                  listing.createdAt
                              ).toLocaleDateString("ro-RO")
                            : "-"}
                    </span>
                </div>
            </div>
        </section>
    );
}