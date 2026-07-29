"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { ListingForm } from "@/app/validators/listing.validator";

import UploadBox from "./UploadBox";
import ImagePreview from "./ImagePreview";

interface Props {
    form: UseFormReturn<ListingForm>;
}

export default function ImageUploader({ form }: Props) {
    const [images, setImages] = useState<string[]>([]);

    function handleFiles(files: FileList | null) {
    if (!files) return;

    const selectedFiles = Array.from(files);

    const urls = selectedFiles.map((file) =>
        URL.createObjectURL(file)
    );

    setImages((prev) => [...prev, ...urls]);

    form.setValue(
        "images",
        [
            ...form.getValues("images"),
            ...selectedFiles,
        ],
        {
            shouldDirty: true,
            shouldValidate: true,
        }
    );
}

    function removeImage(index: number) {
        setImages((prev) => prev.filter((_, i) => i !== index));
    }

    return (
        <div>

            <h2 className="mb-4 text-lg font-semibold">
                Fotografii
            </h2>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">

                <UploadBox onChange={handleFiles} />

                {images.map((image, index) => (
                    <ImagePreview
                        key={image}
                        url={image}
                        onRemove={() => removeImage(index)}
                    />
                ))}

            </div>

            <p className="mt-4 text-sm text-gray-500">
                Adaugă până la 20 de imagini. Prima imagine va fi fotografia principală.
            </p>

        </div>
    );
}