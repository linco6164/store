"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

interface Props {
    images: string[];
    title: string;
}

export default function ListingCarousel({
    images,
    title,
}: Props) {
    const [current, setCurrent] =
        useState(0);

    if (!images.length) {
        return (
            <div className="flex aspect-square items-center justify-center bg-gray-100 text-gray-400">
                <ImageOff size={48} />
            </div>
        );
    }

    function previous(
        e: React.MouseEvent
    ) {
        e.preventDefault();
        e.stopPropagation();

        setCurrent((prev) =>
            prev === 0
                ? images.length - 1
                : prev - 1
        );
    }

    function next(
        e: React.MouseEvent
    ) {
        e.preventDefault();
        e.stopPropagation();

        setCurrent((prev) =>
            prev === images.length - 1
                ? 0
                : prev + 1
        );
    }

    return (
        <div className="group relative aspect-square overflow-hidden bg-gray-100">

            <Image
                src={images[current]}
                alt={title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {images.length > 1 && (
                <>
                    <button
                        onClick={previous}
                        className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow transition hover:scale-110 group-hover:flex"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <button
                        onClick={next}
                        className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow transition hover:scale-110 group-hover:flex"
                    >
                        <ChevronRight size={18} />
                    </button>

                    <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">

                        {images.map((_, index) => (
                            <span
                                key={index}
                                className={`h-2 w-2 rounded-full ${
                                    index === current
                                        ? "bg-white"
                                        : "bg-white/50"
                                }`}
                            />
                        ))}

                    </div>
                </>
            )}

        </div>
    );
}