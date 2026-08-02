"use client";

import { UseFormReturn } from "react-hook-form";

import UploadBox from "./UploadBox";
import ImagePreview from "./ImagePreview";

import { ListingForm } from "@/app/validators/listing.validator";

import FormSection from "./FormSection";
import { ImageIcon } from "lucide-react";

interface Props {
    form: UseFormReturn<ListingForm>;
}

const MAX_IMAGES = 10;

export default function ImageUploader({
    form,
}: Props) {
    const images = form.watch("images") || [];

    function handleChange(
        e: React.ChangeEvent<HTMLInputElement>
    ) {
        const files = Array.from(
            e.target.files || []
        );

        if (!files.length) return;

        const nextImages = [
            ...images,
            ...files,
        ].slice(0, MAX_IMAGES);

        form.setValue(
            "images",
            nextImages,
            {
                shouldDirty: true,
                shouldValidate: true,
            }
        );
    }

    function removeImage(index: number) {
        form.setValue(
            "images",
            images.filter(
                (_, i) => i !== index
            ),
            {
                shouldDirty: true,
            }
        );
    }

    return (
        <FormSection
            title="Photos"
            description="Upload up to 10 high-quality photos."
            icon={<ImageIcon size={22} />}
        >

            <div className="mb-8">

                <h2 className="text-2xl font-bold">
                    Photos
                </h2>

                <p className="mt-2 text-gray-500">
                    Upload up to {MAX_IMAGES} photos.
                    The first image becomes the cover.
                </p>

            </div>

            <UploadBox
                onChange={handleChange}
            />

            {images.length > 0 && (

                <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">

                    {images.map(
                        (image, index) => (
                            <ImagePreview
                                key={`${image.name}-${index}`}
                                file={image}
                                index={index}
                                isCover={index === 0}
                                onDelete={() =>
                                    removeImage(
                                        index
                                    )
                                }
                            />
                        )
                    )}

                    {images.length <
                        MAX_IMAGES && (
                            <UploadBox
                                compact
                                onChange={
                                    handleChange
                                }
                            />
                        )}

                </div>

            )}

        </FormSection>
    );
}