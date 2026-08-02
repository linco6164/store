"use client";

import { UseFormReturn } from "react-hook-form";
import { Package } from "lucide-react";

import { ListingForm } from "@/app/validators/listing.validator";

import FormSection from "./FormSection";

interface Props {
    form: UseFormReturn<ListingForm>;
}

const MAX_LENGTH = 100;

export default function TitleInput({
    form,
}: Props) {
    const value = form.watch("title") || "";
    const error = form.formState.errors.title;

    return (
        <FormSection
    title="Listing title"
    description="Choose a short and descriptive title."
    icon={<Package size={22} />}
>

            <div className="mb-6 flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
                    <Package
                        size={24}
                        className="text-emerald-600"
                    />
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Listing title
                    </h2>

                    <p className="text-gray-500">
                        Choose a short and descriptive title.
                    </p>
                </div>

            </div>

            <input
                {...form.register("title")}
                type="text"
                maxLength={MAX_LENGTH}
                placeholder="Example: iPhone 15 Pro Max 256GB"
                className={`
                    h-14
                    w-full
                    rounded-2xl
                    border
                    px-5
                    text-lg
                    outline-none
                    transition-all

                    ${
                        error
                            ? "border-red-500 focus:ring-4 focus:ring-red-100"
                            : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    }
                `}
            />

            <div className="mt-3 flex items-center justify-between">

                <span
                    className={`text-sm ${
                        error
                            ? "text-red-600"
                            : "text-gray-500"
                    }`}
                >
                    {error?.message ||
                        "Use clear keywords to help buyers find your listing."}
                </span>

                <span
                    className={`text-sm font-medium ${
                        value.length > 80
                            ? "text-amber-600"
                            : "text-gray-400"
                    }`}
                >
                    {value.length}/{MAX_LENGTH}
                </span>

            </div>

        </FormSection>
    );
}