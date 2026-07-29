"use client";

import { UseFormReturn } from "react-hook-form";

import { ProfileFormData } from "../../profile/edit/schema";

interface Props {
    form: UseFormReturn<ProfileFormData>;
}

export default function PersonalInfo({
    form,
}: Props) {
    const {
        register,
        formState: { errors },
    } = form;

    return (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">

            <h2 className="mb-6 text-2xl font-semibold">
                Informații personale
            </h2>

            <div className="grid gap-6">

                {/* Username */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Nume utilizator
                    </label>

                    <input
                        {...register("username")}
                        className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-black"
                        placeholder="Username"
                    />

                    {errors.username && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.username.message}
                        </p>
                    )}
                </div>

                {/* Nume complet */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Nume complet
                    </label>

                    <input
                        {...register("fullName")}
                        className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-black"
                        placeholder="Nume complet"
                    />

                    {errors.fullName && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.fullName.message}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Email
                    </label>

                    <input
                        type="email"
                        {...register("email")}
                        className="w-full rounded-xl border bg-gray-100 px-4 py-3 text-gray-500"
                        disabled
                    />

                    <p className="mt-2 text-xs text-gray-500">
                        Email-ul poate fi modificat doar după verificare.
                    </p>
                </div>

                {/* Telefon */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Telefon
                    </label>

                    <input
                        {...register("phone")}
                        className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-black"
                        placeholder="+40 7xx xxx xxx"
                    />

                    {errors.phone && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.phone.message}
                        </p>
                    )}
                </div>

                {/* Bio */}
                <div>
                    <label className="mb-2 block text-sm font-medium">
                        Descriere
                    </label>

                    <textarea
                        {...register("bio")}
                        rows={5}
                        maxLength={300}
                        className="w-full resize-none rounded-xl border px-4 py-3 outline-none transition focus:border-black"
                        placeholder="Scrie câteva cuvinte despre tine..."
                    />

                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                        <span>
                            Această descriere este vizibilă în profilul tău public.
                        </span>

                        <span>
                            {form.watch("bio")?.length ?? 0}/300
                        </span>
                    </div>

                    {errors.bio && (
                        <p className="mt-2 text-sm text-red-500">
                            {errors.bio.message}
                        </p>
                    )}
                </div>

            </div>

        </section>
    );
}