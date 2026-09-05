"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { notify } from "@/app/lib/notify";

import {
    ImageUploader,
    TitleInput,
    PriceInput,
    DescriptionInput,
    CategorySelect,
    ConditionSelect,
    LocationSelect,
    PreviewCard,
    PublishButton,
    StepHeader,
    SaveDraftButton,
} from "@/app/components/Sell";

import {
    ListingForm,
    listingSchema,
} from "@/app/validators/listing.validator";

import { uploadImages } from "@/app/services/upload.service";
import { listingService } from "@/app/services/listing.service";

export default function SellForm() {
    const [loading, setLoading] = useState(false);

    const form = useForm<ListingForm>({
        resolver: zodResolver(listingSchema),
        defaultValues: {
            title: "",
            category: "",
            condition: "new",
            price: 0,
            city: "",
            description: "",
            images: [],
        },
    });

    const preview = form.watch();

    async function onSubmit(values: ListingForm) {
        try {
            setLoading(true);

            const imageUrls = await uploadImages(values.images);

            await notify.promise(
                listingService.create({
                    ...values,
                    images: imageUrls,
                }),
                {
                    loading: "Publishing your listing...",
                    success: "Your listing has been published!",
                    error: "Failed to publish your listing.",
                }
            );

            form.reset();
        }   finally {
            setLoading(false);
        }
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full"
        >
            <StepHeader />

            <div className="mt-10 grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_350px]">

                {/* LEFT */}

                <div className="min-w-0 space-y-8">

                    <ImageUploader form={form} />

                    <CategorySelect form={form} />

                    <ConditionSelect form={form} />

                    <TitleInput form={form} />

                    <DescriptionInput form={form} />

                    <div className="grid gap-8 md:grid-cols-2">

                        <PriceInput form={form} />

                        <LocationSelect form={form} />

                    </div>

                    <div className="flex flex-col gap-4 border-t border-gray-200 pt-8 sm:flex-row sm:justify-end">

                        <SaveDraftButton
                            onClick={() => {
                                notify.success(
                                    "Your listing has been saved as a draft.",
                                    "You can edit it later from your dashboard.",
                                );
                            }}
                        />

                        <PublishButton
                            loading={loading}
                        />

                    </div>

                </div>

                {/* RIGHT */}

                <aside className="relative hidden xl:block">

                    <div className="sticky top-28">

                        <PreviewCard
                            listing={preview}
                        />

                    </div>

                </aside>

            </div>
        </motion.form>
    );
}