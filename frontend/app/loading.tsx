import GridSkeleton from "./components/Skeleton/GridSkeleton";
import ListingCardSkeleton from "./components/Skeleton/ListingCardSkeleton";

export default function Loading() {
    return (
        <main className="mx-auto max-w-7xl p-6">

            {/* Header */}

            <div className="mb-8 flex items-center justify-between">

                <div className="h-10 w-56 animate-pulse rounded-lg bg-gray-200" />

                <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200" />

            </div>

            {/* Categories */}

            <div className="mb-8 flex gap-3 overflow-hidden">

                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-10 w-28 animate-pulse rounded-full bg-gray-200"
                    />
                ))}

            </div>

            {/* Listings */}

            <GridSkeleton count={12} />

        </main>
    );
}