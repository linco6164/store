import type { Metadata } from "next";
import "./globals.css";

import { Toaster } from "sonner";
import QueryProvider from "./providers/QueryProviders";
import { AuthProvider } from "./providers/AuthProvider";

export const metadata: Metadata = {
    title: "Nexora Store",
    description: "Nexora Store",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <AuthProvider>
                    <QueryProvider>
                        {children}
                    </QueryProvider>
                </AuthProvider>

                <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    duration={3000}
                />
            </body>
        </html>
    );
}