"use client";

import { DollarSign } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { ListingForm } from "@/app/validators/listing.validator";

import FormSection from "./FormSection";

interface Props {
    form: UseFormReturn<ListingForm>;
}

export default function PriceInput({
    form,
}: Props) {
    const error = form.formState.errors.price;
    const value = form.watch("price");

    return (
        <FormSection
            title="Price"
            description="Set a fair price for your item."
            icon={<DollarSign size={22} />}
        >

            <div className="relative">

                <input
                    type="number"
                    min={0}
                    step="1"
                    placeholder="0"
                    {...form.register("price", {
                        valueAsNumber: true,
                    })}
                    className={`
                        h-14
                        w-full
                        rounded-2xl
                        border
                        px-6
                        pr-20
                        text-xl
                        font-semibold
                        outline-none
                        transition-all

                        ${error
                            ? "border-red-500 focus:ring-4 focus:ring-red-100"
                            : "border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        }
                    `}
                />

                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-500">
                    RON
                </span>

            </div>

            <div className="mt-4 flex items-center justify-between">

                <span
                    className={`text-sm ${error
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                >
                    {error?.message ||
                        "Choose a competitive price to attract buyers."}
                </span>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                    {value && value > 0
                        ? `${value.toLocaleString("ro-RO")} RON`
                        : "0 RON"}
                </span>

            </div>

        </FormSection>
    );
}