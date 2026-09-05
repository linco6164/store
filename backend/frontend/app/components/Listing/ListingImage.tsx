"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";

interface Props {
    image?: string;
    title: string;
}

export default function ListingImage({
    image,
    title,
}: Props) {
    return (
        <div className="relative aspect-square w-full overflow-hidden bg-gray-100">

            {image ? (
                <Image
                    src={image}
                    alt={title}
                    fill
                    sizes="(max-width:768px) 100vw,
                           (max-width:1200px) 50vw,
                           25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    priority={false}
                />
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                    <ImageOff size={42} />
                </div>
            )}

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        </div>
    );
}