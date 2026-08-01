import Skeleton from "./Skeleton";

export default function ListingDetailsSkeleton() {
    return (
        <main className="mx-auto max-w-7xl px-4 py-8">
            <div className="grid gap-8 lg:grid-cols-3">
                <section className="space-y-6 lg:col-span-2">
                    <Skeleton className="aspect-square w-full rounded-3xl" />
                    <div className="flex gap-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Skeleton
                                key={index}
                                className="h-20 w-20 rounded-xl"
                            />
                        ))}
                    </div>
                    <div className="space-y-4 rounded-3xl border bg-white p-6">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-7 w-32" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                </section>
                <aside className="space-y-5">
                    <Skeleton className="h-48 w-full rounded-3xl" />
                    <Skeleton className="h-36 w-full rounded-3xl" />
                    <Skeleton className="h-24 w-full rounded-3xl" />
                </aside>
            </div>
        </main>
    );
}
