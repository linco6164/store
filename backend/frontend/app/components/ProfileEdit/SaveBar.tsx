"use client";

import Link from "next/link";
import { Loader2, Save, X } from "lucide-react";

interface Props {
    loading?: boolean;
    cancelHref?: string;
}

export default function SaveBar({
    loading = false,
    cancelHref = "/profile",
}: Props) {
    return (
        <div className="sticky bottom-6 z-20 rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <Link
                    href={cancelHref}
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-gray-300
                        px-6
                        py-3
                        font-medium
                        transition
                        hover:bg-gray-100
                    "
                >
                    <X size={18} />
                    Anulează
                </Link>

                <button
                    type="submit"
                    disabled={loading}
                    className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-black
                        px-6
                        py-3
                        font-medium
                        text-white
                        transition
                        hover:opacity-90
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                    "
                >
                    {loading ? (
                        <>
                            <Loader2
                                size={18}
                                className="animate-spin"
                            />
                            Se salvează...
                        </>
                    ) : (
                        <>
                            <Save size={18} />
                            Salvează modificările
                        </>
                    )}
                </button>

            </div>

        </div>
    );
}