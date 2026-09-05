"use client";

import Skeleton from "./Skeleton";

export default function ConversationSkeleton() {
    return (
        <div className="p-6">
            <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">

                <div className="grid h-[calc(100vh-120px)] grid-cols-[360px_1fr]">

                    {/* Sidebar */}

                    <aside className="border-r bg-white">

                        {/* Search */}

                        <div className="border-b p-5">

                            <Skeleton className="mb-4 h-7 w-32 animate-pulse rounded bg-gray-200" />

                            <Skeleton className="h-11 w-full animate-pulse rounded-xl bg-gray-200" />

                        </div>

                        {/* Conversations */}

                        <div className="space-y-2 p-3">

                            {Array.from({
                                length: 8,
                            }).map((_, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 rounded-xl p-3"
                                >
                                    <Skeleton className="h-14 w-14 animate-pulse rounded-full bg-gray-200" />

                                    <div className="flex-1">

                                        <Skeleton className="mb-2 h-4 w-28 animate-pulse rounded bg-gray-200" />

                                        <Skeleton className="h-3 w-40 animate-pulse rounded bg-gray-200" />

                                    </div>

                                </div>
                            ))}

                        </div>

                    </aside>

                    {/* Chat */}

                    <section className="flex flex-col bg-gray-50">

                        {/* Header */}

                        <div className="flex items-center gap-4 border-b bg-white p-5">

                            <Skeleton className="h-12 w-12 animate-pulse rounded-full bg-gray-200" />

                            <div>

                                <Skeleton className="mb-2 h-4 w-40 animate-pulse rounded bg-gray-200" />

                                <Skeleton className="h-3 w-20 animate-pulse rounded bg-gray-200" />

                            </div>

                        </div>

                        {/* Messages */}

                        <div className="flex-1 space-y-6 p-6">

                            {Array.from({
                                length: 6,
                            }).map((_, index) => (
                                <div
                                    key={index}
                                    className={
                                        index % 2 === 0
                                            ? "flex justify-start"
                                            : "flex justify-end"
                                    }
                                >
                                    <Skeleton
                                        className={`h-16 animate-pulse rounded-2xl bg-gray-200 ${
                                            index % 2 === 0
                                                ? "w-64"
                                                : "w-52"
                                        }`}
                                    />

                                </div>
                            ))}

                        </div>

                        {/* Input */}

                        <div className="border-t bg-white p-4">

                            <Skeleton className="h-14 animate-pulse rounded-2xl bg-gray-200" />

                        </div>

                    </section>

                </div>

            </div>
        </div>
    );
}