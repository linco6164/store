"use client";

import { useState } from "react";
import Image from "next/image";

import { Listing } from "@/app/types/listing";
import GalleryThumbnails from "./GalleryThumbnails";

type GalleryProps = {
    listing: Listing;
};

export default function Gallery({
    listing,
}: GalleryProps) {
    const images = listing.images ?? [];

    const [selectedImage, setSelectedImage] = useState(0);

    if (images.length === 0) {
        return (
            <div className="flex aspect-square items-center justify-center rounded-3xl border bg-gray-100 text-gray-400">
                Fără imagini
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-3xl border bg-white">
                <Image
                    src={images[selectedImage]}
                    alt={listing.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width:768px) 100vw, 60vw"
                />
            </div>

            <GalleryThumbnails
                images={images}
                selected={selectedImage}
                onSelect={setSelectedImage}
            />
        </div>
    );
}