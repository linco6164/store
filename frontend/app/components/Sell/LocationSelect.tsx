"use client";

import { MapPin } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { ListingForm } from "@/app/validators/listing.validator";

import FormSection from "./FormSection";

interface Props {
    form: UseFormReturn<ListingForm>;
}

export default function LocationSelect({
    form,
}: Props) {
    const error = form.formState.errors.city;

    return (
        <FormSection
            title="Location"
            description="Select where the item is located."
            icon={<MapPin size={22} />}
        >

            <div className="mb-6 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                    <MapPin
                        size={24}
                        className="text-emerald-600"
                    />
                </div>

                <div>

                    <h2 className="text-2xl font-bold">
                        Location
                    </h2>

                    <p className="text-gray-500">
                        Select the city where the item is located.
                    </p>

                </div>

            </div>

            <input
                {...form.register("city")}
                type="text"
                placeholder="Example: Bucharest"
                className={`
                    h-14
                    w-full
                    rounded-2xl
                    border
                    px-5
                    text-lg
                    outline-none
                    transition-all

                    ${error
                        ? "border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    }
                `}
            />

            <div className="mt-4">

                <p
                    className={`text-sm ${error
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                >
                    {error?.message ||
                        "This helps buyers find listings near them."}
                </p>

            </div>

        </FormSection>
    );
}