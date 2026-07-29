"use client";

import { UseFormReturn } from "react-hook-form";
import { ListingForm } from "@/app/validators/listing.validator";

interface Props {
    form: UseFormReturn<ListingForm>;
}

export default function TitleInput({ form }: Props) {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">
                Titlu
            </label>

            <input
                {...register("title")}
                placeholder="Ex: Nike Air Force 1 White"
                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-emerald-500"
            />

            {errors.title && (
                <p className="text-sm text-red-500">
                    {errors.title.message}
                </p>
            )}
        </div>
    );
}