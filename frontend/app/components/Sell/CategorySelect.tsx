"use client";

import { UseFormReturn } from "react-hook-form";

import { ListingForm } from "@/app/validators/listing.validator";
import { categories } from "@/app/data/categories";

interface Props {
    form: UseFormReturn<ListingForm>;
}

export default function CategorySelect({ form }: Props) {
    const {
        setValue,
        watch,
        formState: { errors },
    } = form;

    const selected = watch("category");

    return (
        <div className="space-y-3">

            <label className="text-sm font-medium">
                Categorie
            </label>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

                {categories.map((category) => {

                    const active = selected === category.id;

                    return (
                        <button
                            type="button"
                            key={category.id}
                            onClick={() =>
                                setValue("category", category.id, {
                                    shouldValidate: true,
                                })
                            }
                            className={`
                                rounded-2xl
                                border
                                p-5
                                transition

                                ${
                                    active
                                        ? "border-emerald-500 bg-emerald-50"
                                        : "border-gray-200 hover:border-emerald-300"
                                }
                            `}
                        >
                            <div className="text-3xl">
                                {category.icon}
                            </div>

                            <div className="mt-2 text-sm font-medium">
                                {category.name}
                            </div>
                        </button>
                    );
                })}

            </div>

            {errors.category && (
                <p className="text-sm text-red-500">
                    {errors.category.message}
                </p>
            )}

        </div>
    );
}