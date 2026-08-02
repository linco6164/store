"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

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

            await listingService.create({
                ...values,
                images: imageUrls,
            });

            form.reset();
        } finally {
            setLoading(false);
        }
    }

    return (
        <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            onSubmit={form.handleSubmit(onSubmit)}
            className="mx-auto max-w-7xl"
        >
            <StepHeader />

            <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">

                <div className="space-y-8">

                    <ImageUploader form={form} />

                    <CategorySelect form={form} />

                    <ConditionSelect form={form} />



                    <TitleInput form={form} />

                    <DescriptionInput form={form} />

                    <div className="grid gap-8 lg:grid-cols-2">

                        <PriceInput form={form} />

                        <LocationSelect form={form} />

                    </div>

                    <div className="flex flex-col-reverse gap-4 border-t border-gray-200 pt-6 sm:flex-row sm:justify-end">

                        <SaveDraftButton
                            onClick={() => {
                                // TODO:
                            }}
                        />

                        <PublishButton
                            loading={loading}
                        />

                    </div>

                </div>

                <aside className="sticky top-24 self-start w-full max-w-[340px] justify-self-end">

                    <PreviewCard
                        listing={preview}
                    />

                </aside>

            </div>
        </motion.form>
    );
}