"use client";

import { Loader2, Rocket } from "lucide-react";

interface PublishButtonProps {
    loading?: boolean;
    disabled?: boolean;
}

export default function PublishButton({
    loading = false,
    disabled = false,
}: PublishButtonProps) {
    return (
        <button
            type="submit"
            disabled={loading || disabled}
            className="
                group
                relative
                flex
                h-14
                w-full
                items-center
                justify-center
                gap-3
                overflow-hidden
                rounded-2xl
                bg-gradient-to-r
                from-emerald-600
                to-teal-600
                px-6
                text-lg
                font-semibold
                text-white
                shadow-lg
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:shadow-2xl
                disabled:cursor-not-allowed
                disabled:opacity-60
            "
        >
            <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex items-center gap-3">

                {loading ? (
                    <>
                        <Loader2
                            size={22}
                            className="animate-spin"
                        />

                        <span>
                            Publishing...
                        </span>
                    </>
                ) : (
                    <>
                        <Rocket size={20} />

                        <span>
                            Publish Listing
                        </span>
                    </>
                )}

            </div>

        </button>
    );
}