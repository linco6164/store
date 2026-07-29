"use client";

import { UseFormReturn } from "react-hook-form";

import { ListingForm } from "@/app/validators/listing.validator";
import { cities } from "@/app/data/cities";

interface Props {
    form: UseFormReturn<ListingForm>;
}

export default function LocationSelect({ form }: Props) {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <div className="space-y-2">

            <label className="text-sm font-medium">
                Oraș
            </label>

            <select
                {...register("city")}
                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-emerald-500"
            >
                <option value="">
                    Selectează orașul
                </option>

                {cities.map((city) => (
                    <option
                        key={city}
                        value={city}
                    >
                        {city}
                    </option>
                ))}
            </select>

            {errors.city && (
                <p className="text-sm text-red-500">
                    {errors.city.message}
                </p>
            )}

        </div>
    );
}