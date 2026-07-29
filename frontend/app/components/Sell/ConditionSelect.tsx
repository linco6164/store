"use client";

import { UseFormReturn } from "react-hook-form";
import { Check } from "lucide-react";

import { ListingForm } from "@/app/validators/listing.validator";
import { conditions } from "@/app/data/conditions";

interface Props {
    form: UseFormReturn<ListingForm>;
}

export default function ConditionSelect({ form }: Props) {
    const {
        watch,
        setValue,
        formState: { errors },
    } = form;

    const selected = watch("condition");

    return (
        <div className="space-y-3">

            <label className="text-sm font-medium">
                Starea produsului
            </label>

            <div className="space-y-3">

                {conditions.map((condition) => {

                    const active = selected === condition.value;

                    return (
                        <button
                            key={condition.value}
                            type="button"
                            onClick={() =>
                                setValue("condition", condition.value, {
                                    shouldValidate: true,
                                })
                            }
                            className={`
                                flex
                                w-full
                                items-center
                                justify-between
                                rounded-2xl
                                border
                                p-5
                                text-left
                                transition

                                ${
                                    active
                                        ? "border-emerald-500 bg-emerald-50"
                                        : "hover:border-emerald-300"
                                }
                            `}
                        >
                            <div>

                                <p className="font-semibold">
                                    {condition.title}
                                </p>

                                <p className="mt-1 text-sm text-gray-500">
                                    {condition.description}
                                </p>

                            </div>

                            {active && (
                                <Check
                                    className="text-emerald-600"
                                    size={24}
                                />
                            )}

                        </button>
                    );

                })}

            </div>

            {errors.condition && (
                <p className="text-sm text-red-500">
                    {errors.condition.message}
                </p>
            )}

        </div>
    );
}