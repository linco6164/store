"use client";

import Image from "next/image";
import { Camera } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { ProfileFormData } from "../../(app)/profile/edit/schema";
import { uploadImages } from "../../services/upload.service";

interface Props {
    form: UseFormReturn<ProfileFormData>;
}

export default function AvatarUploader({
    form,
}: Props) {
    const avatar = form.watch("avatar");

    async function handleUpload(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];

        if (!file) return;

        try {
            const formData = new FormData();
            formData.append("file", file);

            /**
             * TODO:
             * Înlocuiește cu serviciul tău de upload în Cloudflare R2.
             *
             * Exemplu:
             * const url = await uploadService.uploadAvatar(formData);
             * form.setValue("avatar", url);
             */

            const [preview] = await uploadImages([file], "avatars");

            form.setValue("avatar", preview, {
                shouldDirty: true,
            });
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <section className="rounded-3xl border bg-white p-8 shadow-sm">

            <h2 className="mb-6 text-2xl font-semibold">
                Avatar
            </h2>

            <div className="flex flex-col items-center gap-6 md:flex-row">

                <div className="relative h-32 w-32 overflow-hidden rounded-full border bg-gray-100">

                    {avatar ? (
                        <Image
                            src={avatar}
                            alt="Avatar"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-5xl font-bold text-gray-400">
                            ?
                        </div>
                    )}

                </div>

                <div className="space-y-3">

                    <label
                        htmlFor="avatar"
                        className="
                            inline-flex
                            cursor-pointer
                            items-center
                            gap-2
                            rounded-xl
                            bg-black
                            px-5
                            py-3
                            text-sm
                            font-medium
                            text-white
                            transition
                            hover:opacity-90
                        "
                    >
                        <Camera size={18} />
                        Schimbă avatarul
                    </label>

                    <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUpload}
                    />

                    <p className="text-sm text-gray-500">
                        JPG, PNG sau WEBP • maxim 5 MB
                    </p>

                </div>

            </div>

        </section>
    );
}
