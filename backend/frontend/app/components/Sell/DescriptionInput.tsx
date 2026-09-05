"use client";

import { FileText } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { ListingForm } from "@/app/validators/listing.validator";

import FormSection from "./FormSection";

interface Props {
    form: UseFormReturn<ListingForm>;
}

const MAX_LENGTH = 2000;

export default function DescriptionInput({
    form,
}: Props) {
    const value = form.watch("description") || "";
    const error = form.formState.errors.description;

    return (
        <FormSection
            title="Description"
            description="Describe your item in as much detail as possible."
            icon={<FileText size={22} />}
        >

            <textarea
                {...form.register("description")}
                rows={6}
                maxLength={MAX_LENGTH}
                placeholder="Example: The phone is in excellent condition, purchased in 2025, always used with a case and screen protector..."
                className={`
                    w-full
                    resize-y
                    rounded-2xl
                    border
                    px-5
                    py-4
                    text-base
                    leading-7
                    outline-none
                    transition-all

                    ${error
                        ? "border-red-500 focus:ring-4 focus:ring-red-100"
                        : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    }
                `}
            />

            <div className="mt-4 flex items-start justify-between gap-6">

                <div>

                    <p
                        className={`text-sm ${error
                                ? "text-red-600"
                                : "text-gray-500"
                            }`}
                    >
                        {error?.message ||
                            "A detailed description helps buyers make faster decisions."}
                    </p>

                    <ul className="mt-3 space-y-1 text-sm text-gray-400">

                        <li>• Mention the item's condition.</li>

                        <li>• Include accessories or original packaging.</li>

                        <li>• Mention defects honestly.</li>

                        <li>• Add purchase date if relevant.</li>

                    </ul>

                </div>

                <span
                    className={`whitespace-nowrap text-sm font-medium ${value.length > 1800
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