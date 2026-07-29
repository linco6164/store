"use client";

import { AlertTriangle } from "lucide-react";

interface Props {
    error: Error;
    reset: () => void;
}

export default function Error({
    error,
    reset,
}: Props) {
    console.error(error);

    return (
        <main className="flex min-h-[70vh] items-center justify-center px-4">

            <div className="max-w-md rounded-3xl border bg-white p-10 text-center shadow-sm">

                <AlertTriangle
                    className="mx-auto mb-6 text-red-500"
                    size={60}
                />

                <h1 className="text-3xl font-bold">
                    A apărut o eroare
                </h1>

                <p className="mt-4 text-gray-500">
                    Nu am putut încărca pagina de editare a profilului.
                </p>

                <button
                    onClick={reset}
                    className="mt-8 rounded-xl bg-black px-6 py-3 text-white transition hover:opacity-90"
                >
                    Încearcă din nou
                </button>

            </div>

        </main>
    );
}