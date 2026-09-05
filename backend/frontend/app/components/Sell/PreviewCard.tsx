"use client";

import Image from "next/image";
import {
    Eye,
    ImageOff,
    MapPin,
    Tag,
} from "lucide-react";

import { ListingForm } from "@/app/validators/listing.validator";

interface Props {
    listing: Partial<ListingForm>;
}

export default function PreviewCard({
    listing,
}: Props) {
    const image = listing.images?.[0];

    return (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">

            {/* Header */}

            <div className="flex items-center gap-2 border-b px-5 py-4">

                <Eye
                    size={18}
                    className="text-emerald-600"
                />

                <h3 className="font-bold text-gray-900">
                    Live Preview
                </h3>

            </div>

            {/* Image */}

            <div className="relative overflow-hidden bg-gray-100">

                {image ? (
                    <div className="relative aspect-[4/3]">

                        <Image
                            src={URL.createObjectURL(image)}
                            alt=""
                            fill
                            className="object-cover"
                        />

                    </div>
                ) : (
                    <div className="flex h-52 flex-col items-center justify-center">

                        <ImageOff
                            size={56}
                            className="text-gray-300"
                        />

                        <p className="mt-4 text-sm text-gray-400">
                            No photos uploaded yet
                        </p>

                    </div>
                )}

            </div>

            {/* Content */}

            <div className="space-y-5 p-5">

                <div>

                    <h2 className="line-clamp-2 text-xl font-bold text-gray-900">

                        {listing.title || "Your listing title"}

                    </h2>

                    <div className="mt-3 flex items-center gap-2">

                        <Tag
                            size={17}
                            className="text-emerald-600"
                        />

                        <span className="text-3xl font-black text-emerald-600">

                            {listing.price
                                ? `${listing.price.toLocaleString("ro-RO")} Lei`
                                : "0 Lei"}

                        </span>

                    </div>

                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">

                    <MapPin size={16} />

                    <span>
                        {listing.city || "Location"}
                    </span>

                </div>

                <div className="rounded-2xl bg-gray-50 p-4">

                    <p className="line-clamp-5 whitespace-pre-wrap text-sm leading-6 text-gray-600">

                        {listing.description ||
                            "Your description will appear here..."}

                    </p>

                </div>

                <div className="flex flex-wrap gap-2">

                    {listing.category && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">

                            {listing.category}

                        </span>
                    )}

                    {listing.condition && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold capitalize text-emerald-700">

                            {listing.condition.replace("_", " ")}

                        </span>
                    )}

                </div>

            </div>

        </div>
    );
}