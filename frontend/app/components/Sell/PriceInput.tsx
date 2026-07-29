"use client";

import { UseFormReturn } from "react-hook-form";
import { ListingForm } from "@/app/validators/listing.validator";

interface Props {
    form: UseFormReturn<ListingForm>;
}

export default function PriceInput({ form }: Props) {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">
                Preț
            </label>

            <div className="relative">
                <input
                    type="number"
                    {...form.register("price", {
                        valueAsNumber: true,
                    })}
                    className="w-full rounded-xl border px-4 py-3 pr-14 outline-none focus:border-emerald-500"
                />

                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    lei
                </span>
            </div>

            {errors.price && (
                <p className="text-sm text-red-500">
                    {errors.price.message}
                </p>
            )}
        </div>
    );
}