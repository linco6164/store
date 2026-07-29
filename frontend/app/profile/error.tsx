"use client";

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
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">

            <h1 className="text-3xl font-bold">
                A apărut o eroare
            </h1>

            <p className="mt-3 max-w-md text-gray-500">
                Nu am putut încărca profilul. Încearcă din nou.
            </p>

            <button
                onClick={reset}
                className="mt-8 rounded-xl bg-black px-6 py-3 text-white transition hover:opacity-90"
            >
                Încearcă din nou
            </button>

        </div>
    );
}