"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import ImageUploader from "./ImageUploader";
import TitleInput from "./TitleInput";
import PriceInput from "./PriceInput";
import DescriptionInput from "./DescriptionInput";
import CategorySelect from "./CategorySelect";
import ConditionSelect from "./ConditionSelect";
import LocationSelect from "./LocationSelect";
import PreviewCard from "./PreviewCard";

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

    const onSubmit = async (values: ListingForm) => {
        try {
            setLoading(true);

            // Upload imagini în Cloudflare R2
            const imageUrls = await uploadImages(values.images);

            // Creează anunțul
            await listingService.create({
                ...values,
                images: imageUrls,
            });

            form.reset({
                title: "",
                category: "",
                condition: "new",
                price: 0,
                city: "",
                description: "",
                images: [],
            });

            alert("Anunțul a fost publicat cu succes!");
        } catch (error) {
            console.error(error);
            alert("Publicarea anunțului a eșuat.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-8 lg:grid-cols-[1fr_380px]"
        >
            <div className="space-y-8">
                <ImageUploader form={form} />

                <TitleInput form={form} />

                <CategorySelect form={form} />

                <ConditionSelect form={form} />

                <PriceInput form={form} />

                <DescriptionInput form={form} />

                <LocationSelect form={form} />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-black px-6 py-4 text-lg font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading
                        ? "Se publică..."
                        : "Publică anunțul"}
                </button>
            </div>

            <div>
                <PreviewCard listing={preview} />
            </div>
        </form>
    );
}