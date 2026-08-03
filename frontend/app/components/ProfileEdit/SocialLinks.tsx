"use client";

import { UseFormReturn } from "react-hook-form";
import { ProfileFormData } from "../../(app)/profile/edit/schema";

interface Props {
    form: UseFormReturn<ProfileFormData>;
}

export default function SocialLinks({
    form,
}: Props) {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">

            <h2 className="mb-6 text-2xl font-semibold">
                Rețele sociale
            </h2>

            <div className="grid gap-6">

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Instagram
                    </label>

                    <input
                        {...register("instagram")}
                        placeholder="https://instagram.com/..."
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                    />

                    {errors.instagram && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.instagram.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Facebook
                    </label>

                    <input
                        {...register("facebook")}
                        placeholder="https://facebook.com/..."
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                    />

                    {errors.facebook && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.facebook.message}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Website
                    </label>

                    <input
                        {...register("website")}
                        placeholder="https://..."
                        className="w-full rounded-xl border px-4 py-3 outline-none focus:border-black"
                    />

                    {errors.website && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.website.message}
                        </p>
                    )}
                </div>

            </div>

        </section>
    );
}