"use client";

import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

interface ImageUploaderProps {
    images: File[];
    onChange: (files: File[]) => void;
}

export default function ImageUploader({
    images,
    onChange,
}: ImageUploaderProps) {
    function handleFiles(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        if (!e.target.files) return;

        const selected = Array.from(e.target.files);

        onChange([...images, ...selected].slice(0, 10));
    }

    function removeImage(index: number) {
        onChange(images.filter((_, i) => i !== index));
    }

    return (
        <div className="w-full">

            <label className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition hover:bg-gray-100">

                <ImagePlus size={22} />

                <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleFiles}
                />

            </label>

            {images.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-3">

                    {images.map((file, index) => (
                        <div
                            key={index}
                            className="relative"
                        >

                            <Image
                                src={URL.createObjectURL(file)}
                                alt=""
                                width={90}
                                height={90}
                                className="rounded-xl border object-cover"
                            />

                            <button
                                onClick={() =>
                                    removeImage(index)
                                }
                                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white shadow"
                            >
                                <X size={12} />
                            </button>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}