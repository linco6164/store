"use client";

import { UseFormReturn } from "react-hook-form";

import { ProfileFormData } from "../../profile/edit/schema";

interface Props {
    form: UseFormReturn<ProfileFormData>;
}

export default function AddressForm({
    form,
}: Props) {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">

            <h2 className="mb-6 text-2xl font-semibold">
                Locație
            </h2>

            <div className="grid gap-6 md:grid-cols-2">

                {/* Țară */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Țară
                    </label>

                    <input
                        {...register("country")}
                        placeholder="România"
                        className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-black"
                    />

                    {errors.country && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.country.message}
                        </p>
                    )}
                </div>

                {/* Oraș */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Oraș
                    </label>

                    <input
                        {...register("city")}
                        placeholder="București"
                        className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-black"
                    />

                    {errors.city && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.city.message}
                        </p>
                    )}
                </div>

                {/* Județ */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Județ
                    </label>

                    <input
                        {...register("county")}
                        placeholder="Ilfov"
                        className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-black"
                    />

                    {errors.county && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.county.message}
                        </p>
                    )}
                </div>

                {/* Cod poștal */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Cod poștal
                    </label>

                    <input
                        {...register("postalCode")}
                        placeholder="010101"
                        className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-black"
                    />

                    {errors.postalCode && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.postalCode.message}
                        </p>
                    )}
                </div>

            </div>

            <p className="mt-6 text-sm text-gray-500">
                Aceste informații sunt folosite pentru a personaliza experiența în aplicație și vor putea fi utilizate ulterior pentru livrări.
            </p>

        </section>
    );
}