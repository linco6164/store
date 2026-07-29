"use client";

import Image from "next/image";
import clsx from "clsx";

type GalleryThumbnailsProps = {
    images: string[];
    selected: number;
    onSelect: (index: number) => void;
};

export default function GalleryThumbnails({
    images,
    selected,
    onSelect,
}: GalleryThumbnailsProps) {
    if (!images.length) {
        return null;
    }

    return (
        <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((image, index) => (
                <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => onSelect(index)}
                    className={clsx(
                        "relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all",
                        selected === index
                            ? "border-black"
                            : "border-gray-200 hover:border-gray-400"
                    )}
                >
                    <Image
                        src={image}
                        alt={`Imagine ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="96px"
                    />
                </button>
            ))}
        </div>
    );
}