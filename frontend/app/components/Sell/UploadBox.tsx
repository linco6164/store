"use client";

import { UploadCloud, Plus } from "lucide-react";

interface UploadBoxProps {
    multiple?: boolean;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement>
    ) => void;
    compact?: boolean;
}

export default function UploadBox({
    multiple = true,
    onChange,
    compact = false,
}: UploadBoxProps) {
    if (compact) {
        return (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50">

                <Plus
                    size={34}
                    className="text-gray-500"
                />

                <span className="mt-2 text-sm text-gray-500">
                    Add
                </span>

                <input
                    hidden
                    multiple={multiple}
                    type="file"
                    accept="image/*"
                    onChange={onChange}
                />

            </label>
        );
    }

    return (
        <label className="group flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-gray-50 px-8 py-14 transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 transition group-hover:scale-110">

                <UploadCloud
                    size={40}
                    className="text-emerald-600"
                />

            </div>

            <h3 className="mt-6 text-xl font-bold text-gray-900">
                Upload your photos
            </h3>

            <p className="mt-2 text-center text-gray-500">
                Drag & Drop images here
                <br />
                or click to browse
            </p>

            <div className="mt-6 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white">
                Choose Images
            </div>

            <input
                hidden
                multiple={multiple}
                type="file"
                accept="image/*"
                onChange={onChange}
            />

        </label>
    );
}