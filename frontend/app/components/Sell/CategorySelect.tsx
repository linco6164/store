"use client";

import { UseFormReturn } from "react-hook-form";
import {
    Smartphone,
    Shirt,
    Sofa,
    Car,
    Laptop,
    Gamepad2,
    Baby,
    Dumbbell,
    Grid2X2,
} from "lucide-react";

import CategoryCard from "./CategoryCard";

import { ListingForm } from "@/app/validators/listing.validator";

import FormSection from "./FormSection";

interface Props {
    form: UseFormReturn<ListingForm>;
}

const categories = [
    {
        value: "electronics",
        title: "Electronics",
        description: "Phones, laptops, tablets and more.",
        icon: Smartphone,
    },
    {
        value: "fashion",
        title: "Fashion",
        description: "Clothes, shoes and accessories.",
        icon: Shirt,
    },
    {
        value: "home",
        title: "Home",
        description: "Furniture and home decor.",
        icon: Sofa,
    },
    {
        value: "auto",
        title: "Auto",
        description: "Cars, parts and accessories.",
        icon: Car,
    },
    {
        value: "computers",
        title: "Computers",
        description: "PCs, components and peripherals.",
        icon: Laptop,
    },
    {
        value: "gaming",
        title: "Gaming",
        description: "Consoles, games and accessories.",
        icon: Gamepad2,
    },
    {
        value: "kids",
        title: "Kids",
        description: "Everything for children.",
        icon: Baby,
    },
    {
        value: "sports",
        title: "Sports",
        description: "Fitness and outdoor equipment.",
        icon: Dumbbell,
    },
];

export default function CategorySelect({
    form,
}: Props) {
    const selected =
        form.watch("category");

    return (
        <FormSection
            title="Category"
            description="Choose the category that best describes your listing."
            icon={<Grid2X2 size={22} />}
        >

            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">

                {categories.map((category) => {
                    const Icon =
                        category.icon;

                    return (
                        <CategoryCard
                            key={category.value}
                            title={category.title}
                            description={category.description}
                            icon={<Icon size={28} />}
                            selected={
                                selected ===
                                category.value
                            }
                            onClick={() =>
                                form.setValue(
                                    "category",
                                    category.value,
                                    {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                    }
                                )
                            }
                        />
                    );
                })}

            </div>

            {form.formState.errors.category && (
                <p className="mt-4 text-sm font-medium text-red-600">
                    {
                        form.formState.errors.category
                            ?.message
                    }
                </p>
            )}

        </FormSection>
    );
}