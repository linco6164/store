"use client";

import { useMemo } from "react";

import ListingCard from "../Listing/ListingCard";

import { Listing } from "@/app/types/listing";
import { ListingForm } from "@/app/validators/listing.validator";

interface PreviewProps {
    listing: Partial<ListingForm>;
}

export default function PreviewCard({ listing }: PreviewProps) {
    const previewImages = useMemo(() => {
        if (!listing.images || listing.images.length === 0) {
            return ["/placeholder-product.png"];
        }

        return listing.images.map((image) =>
            image instanceof File
                ? URL.createObjectURL(image)
                : image
        );
    }, [listing.images]);

    const previewListing: Listing = {
        _id: "preview",

        title: listing.title || "Titlul produsului",

        category: listing.category || "",

        condition: listing.condition || "new",

        price: listing.price ?? 0,

        city: listing.city || "Oraș",

        description: listing.description || "",

        images: previewImages,

        currency: "RON",

        favorite: false,

        createdAt: new Date().toISOString(),

        seller: {
            _id: "preview",
            username: "Tu",
            avatar: "",
        },
    };

    return (
        <div className="sticky top-24">
            <h2 className="mb-4 text-lg font-semibold">
                Previzualizare
            </h2>

            <ListingCard listing={previewListing} />
        </div>
    );
}