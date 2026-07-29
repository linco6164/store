"use client";

import { ImagePlus } from "lucide-react";

interface UploadBoxProps {
    onChange: (files: FileList | null) => void;
}

export default function UploadBox({ onChange }: UploadBoxProps) {
    return (
        <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-emerald-500 hover:bg-emerald-50">
            <ImagePlus className="mb-3 h-10 w-10 text-gray-400" />

            <span className="font-medium">
                Adaugă fotografii
            </span>

            <span className="mt-1 text-sm text-gray-500">
                JPG, PNG sau WEBP
            </span>

            <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => onChange(e.target.files)}
            />
        </label>
    );
}