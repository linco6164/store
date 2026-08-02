"use client";

import { Save } from "lucide-react";

interface Props {
    loading?: boolean;
    onClick?: () => void;
}

export default function SaveDraftButton({
    loading = false,
    onClick,
}: Props) {
    return (
        <button
            type="button"
            disabled={loading}
            onClick={onClick}
            className="
                flex
                h-14
                items-center
                justify-center
                gap-3
                rounded-2xl
                border
                border-gray-200
                bg-white
                px-6
                font-semibold
                transition-all
                hover:bg-gray-50
                disabled:opacity-50
            "
        >
            <Save size={18} />

            {loading
                ? "Saving..."
                : "Save Draft"}
        </button>
    );
}