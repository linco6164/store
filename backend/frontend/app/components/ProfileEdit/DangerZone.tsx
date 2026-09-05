"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default function DangerZone() {
    return (
        <section className="rounded-3xl border border-red-200 bg-red-50 p-8">

            <div className="flex items-center gap-3">

                <AlertTriangle
                    className="text-red-600"
                    size={28}
                />

                <div>

                    <h2 className="text-2xl font-semibold text-red-700">
                        Zonă periculoasă
                    </h2>

                    <p className="text-sm text-red-600">
                        Acțiunile de mai jos sunt ireversibile.
                    </p>

                </div>

            </div>

            <div className="mt-8 flex flex-col gap-4">

                <button
                    type="button"
                    className="
                        rounded-xl
                        border
                        border-red-300
                        bg-white
                        px-5
                        py-3
                        text-red-600
                        transition
                        hover:bg-red-100
                    "
                >
                    Schimbă parola
                </button>

                <button
                    type="button"
                    className="
                        rounded-xl
                        border
                        border-red-300
                        bg-white
                        px-5
                        py-3
                        text-red-600
                        transition
                        hover:bg-red-100
                    "
                >
                    Dezactivează contul
                </button>

                <Link
                    href="/profile/delete"
                    className="
                        rounded-xl
                        bg-red-600
                        px-5
                        py-3
                        text-center
                        font-medium
                        text-white
                        transition
                        hover:bg-red-700
                    "
                >
                    Șterge definitiv contul
                </Link>

            </div>

        </section>
    );
}