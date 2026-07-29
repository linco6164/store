"use client";

import Image from "next/image";

interface Props {
    image: string;
    title: string;
}

export default function ListingImage({
    image,
    title,
}: Props) {
    return (
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
            <Image
                src={image}
                alt={title}
                fill
                className="object-cover transition duration-300 hover:scale-105"
            />
        </div>
    );
}