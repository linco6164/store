"use client";

import { UseFormReturn } from "react-hook-form";
import { BadgeCheck, CheckCircle2 } from "lucide-react";

import { ListingForm } from "@/app/validators/listing.validator";

import FormSection from "./FormSection";

interface Props {
    form: UseFormReturn<ListingForm>;
}

const conditions = [
    {
        value: "new",
        title: "New",
        description: "Unused item, in original packaging.",
    },
    {
        value: "like_new",
        title: "Like New",
        description: "Almost no signs of use.",
    },
    {
        value: "good",
        title: "Good",
        description: "Normal signs of use, fully functional.",
    },
    {
        value: "fair",
        title: "Fair",
        description: "Visible wear but works correctly.",
    },
];

export default function ConditionSelect({
    form,
}: Props) {
    const selected = form.watch("condition");
    const error = form.formState.errors.condition;

    return (
        <FormSection
            title="Condition"
            description="Help buyers understand the condition of your item."
            icon={<BadgeCheck size={22} />}
        >

            <div className="mb-8">

                <h2 className="text-2xl font-bold">
                    Condition
                </h2>

                <p className="mt-2 text-gray-500">
                    Tell buyers the current condition of your item.
                </p>

            </div>

            <div className="grid gap-4">

                {conditions.map((condition) => {
                    const active =
                        selected === condition.value;

                    return (
                        <button
                            key={condition.value}
                            type="button"
                            onClick={() =>
                                form.setValue(
                                    "condition",
                                    condition.value as ListingForm["condition"],
                                    {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                    }
                                )
                            }
                            className={`
                                flex
                                items-start
                                justify-between
                                rounded-2xl
                                border
                                p-4
                                text-left
                                transition-all
                                duration-200

                                ${active
                                    ? "border-emerald-500 bg-emerald-50"
                                    : "border-gray-200 hover:border-emerald-300 hover:bg-gray-50"
                                }
                            `}
                        >
                            <div>

                                <h3 className="font-semibold text-gray-900">
                                    {condition.title}
                                </h3>

                                <p className="mt-1 text-sm text-gray-500">
                                    {condition.description}
                                </p>

                            </div>

                            {active && (
                                <CheckCircle2
                                    size={22}
                                    className="text-emerald-600"
                                />
                            )}

                        </button>
                    );
                })}

            </div>

            {error && (
                <p className="mt-4 text-sm text-red-600">
                    {error.message}
                </p>
            )}

        </FormSection>
    );
}