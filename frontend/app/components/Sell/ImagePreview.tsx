"use client";

import { X } from "lucide-react";

interface Props {
    url: string;
    onRemove: () => void;
}

export default function ImagePreview({
    url,
    onRemove,
}: Props) {
    return (
        <div className="relative aspect-square overflow-hidden rounded-2xl">
            <img
                src={url}
                alt="Preview"
                className="h-full w-full object-cover"
            />

            <button
                type="button"
                onClick={onRemove}
                className="absolute right-2 top-2 rounded-full bg-white p-1 shadow"
            >
                <X size={18} />
            </button>
        </div>
    );
}