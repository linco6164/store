"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";

import ImageUploader from "./ImageUploader";
import TitleInput from "./TitleInput";
import PriceInput from "./PriceInput";
import DescriptionInput from "./DescriptionInput";
import CategorySelect from "./CategorySelect";
import ConditionSelect from "./ConditionSelect";
import LocationSelect from "./LocationSelect";
import PreviewCard from "./PreviewCard";
import PublishButton from "./PublishButton";
import Stepper from "./Stepper";
import StepHeader from "./StepHeader";
import SaveDraftButton from "./SaveDraftButton";

import {
    ListingForm,
    listingSchema,
} from "@/app/validators/listing.validator";

import { uploadImages } from "../../services/upload.service";
import { listingService } from "../../services/listing.service";

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

    async function onSubmit(
        values: ListingForm
    ) {
        try {
            setLoading(true);

            const imageUrls =
                await uploadImages(
                    values.images
                );

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
            initial={{
                opacity: 0,
                y: 20,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            onSubmit={form.handleSubmit(
                onSubmit
            )}
            className="mx-auto max-w-7xl"
        >
            <StepHeader />

            <Stepper
                currentStep={1}
                totalSteps={6}
            />

            <div className="mt-10 grid gap-10 xl:grid-cols-[1fr_420px]">

                <div className="space-y-8">

                    <ImageUploader
                        form={form}
                    />

                    <TitleInput
                        form={form}
                    />

                    <CategorySelect
                        form={form}
                    />

                    <ConditionSelect
                        form={form}
                    />

                    <PriceInput
                        form={form}
                    />

                    <DescriptionInput
                        form={form}
                    />

                    <LocationSelect
                        form={form}
                    />

                    <div className="flex flex-col gap-4 sm:flex-row">

                        <SaveDraftButton
                            onClick={() => {
                                // TODO:
                                // Salvare draft
                            }}
                        />

                        <div className="flex-1">
                            <PublishButton
                                loading={loading}
                            />
                        </div>

                    </div>

                </div>

                <div className="sticky top-24 h-fit">

                    <PreviewCard
                        listing={preview}
                    />

                </div>

            </div>

        </motion.form>
    );
}