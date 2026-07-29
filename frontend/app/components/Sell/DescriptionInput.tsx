"use client";

import { UseFormReturn } from "react-hook-form";
import { ListingForm } from "@/app/validators/listing.validator";

interface Props {
    form: UseFormReturn<ListingForm>;
}

export default function DescriptionInput({ form }: Props) {
    const {
        register,
        watch,
        formState: { errors },
    } = form;

    const description = watch("description");

    return (
        <div className="space-y-2">

            <div className="flex justify-between">

                <label className="text-sm font-medium">
                    Descriere
                </label>

                <span className="text-sm text-gray-400">
                    {description.length}/3000
                </span>

            </div>

            <textarea
                rows={6}
                {...register("description")}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-emerald-500"
            />

            {errors.description && (
                <p className="text-sm text-red-500">
                    {errors.description.message}
                </p>
            )}

        </div>
    );
}