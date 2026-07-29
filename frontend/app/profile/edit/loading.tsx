export default function LoadingEditProfile() {
    return (
        <main className="mx-auto max-w-4xl px-4 py-10">

            <div className="animate-pulse">

                {/* Titlu */}
                <div className="mb-10 space-y-3">
                    <div className="h-10 w-72 rounded bg-gray-200" />
                    <div className="h-5 w-96 rounded bg-gray-200" />
                </div>

                {/* Avatar */}
                <div className="mb-8 rounded-3xl border bg-white p-8">
                    <div className="flex items-center gap-6">
                        <div className="h-32 w-32 rounded-full bg-gray-200" />

                        <div className="space-y-3">
                            <div className="h-10 w-48 rounded bg-gray-200" />
                            <div className="h-4 w-64 rounded bg-gray-200" />
                        </div>
                    </div>
                </div>

                {/* Form */}
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="mb-8 rounded-3xl border bg-white p-8"
                    >
                        <div className="mb-6 h-8 w-52 rounded bg-gray-200" />

                        <div className="space-y-5">
                            {[1, 2, 3].map((field) => (
                                <div key={field}>
                                    <div className="mb-2 h-4 w-28 rounded bg-gray-200" />
                                    <div className="h-12 rounded-xl bg-gray-200" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Save */}
                <div className="sticky bottom-6 rounded-2xl border bg-white p-5">
                    <div className="flex justify-end gap-4">
                        <div className="h-12 w-36 rounded-xl bg-gray-200" />
                        <div className="h-12 w-56 rounded-xl bg-gray-200" />
                    </div>
                </div>

            </div>

        </main>
    );
}