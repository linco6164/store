export default function LoadingProfile() {
    return (
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">

            {/* Header */}
            <div className="animate-pulse rounded-3xl border bg-white p-8">
                <div className="flex items-center gap-6">

                    <div className="h-28 w-28 rounded-full bg-gray-200" />

                    <div className="space-y-3">
                        <div className="h-8 w-56 rounded bg-gray-200" />
                        <div className="h-5 w-72 rounded bg-gray-200" />
                        <div className="h-5 w-40 rounded bg-gray-200" />
                    </div>

                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-5">

                <div className="h-28 animate-pulse rounded-2xl bg-gray-200" />

                <div className="h-28 animate-pulse rounded-2xl bg-gray-200" />

                <div className="h-28 animate-pulse rounded-2xl bg-gray-200" />

            </div>

            {/* Listings */}
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">

                {Array.from({ length: 8 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-80 animate-pulse rounded-3xl bg-gray-200"
                    />
                ))}

            </div>

        </div>
    );
}