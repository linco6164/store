"use client";

import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";

import { ReactNode, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function QueryProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5,
                        gcTime: 1000 * 60 * 30,
                        retry: 1,
                        refetchOnWindowFocus: false,
                        refetchOnReconnect: true,
                    },
                },
            })
    );

    return (
        <>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>

            {process.env.NODE_ENV === "development" && (
                <ReactQueryDevtools initialIsOpen={false} />
            )}
        </>
    );
}