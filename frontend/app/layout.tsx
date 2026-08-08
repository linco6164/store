import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./providers/AuthProvider";
import QueryProvider from "./providers/QueryProviders";
import NavigationLoading from "@/app/components/ui/NavigationLoading";

import type { Metadata } from "next";

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <NavigationLoading />
        <QueryProvider>
          <GoogleOAuthProvider
            clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
          >
            <AuthProvider>
              {children}
            </AuthProvider>
          </GoogleOAuthProvider>
        </QueryProvider>
      </body>
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={3000}
      />
    </html>
  );
}

export const metadata: Metadata = {
    metadataBase: new URL("https://nx-store.com"),

    title: {
        default: "Nexora Marketplace",
        template: "%s | Nexora Marketplace",
    },

    description:
        "Buy, sell and discover great deals on Nexora Marketplace.",

    applicationName: "Nexora Marketplace",

    keywords: [
        "marketplace",
        "buy",
        "sell",
        "second hand",
        "nexora",
        "vinted alternative",
    ],

    authors: [
        {
            name: "Nexora",
        },
    ],

    creator: "Nexora",

    publisher: "Nexora",

    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },

    openGraph: {
        title: "Nexora Marketplace",
        description:
            "Buy, sell and discover great deals.",
        url: "https://nx-store.com",
        siteName: "Nexora Marketplace",
        locale: "en_US",
        type: "website",
    },

    twitter: {
        card: "summary_large_image",
        title: "Nexora Marketplace",
        description:
            "Buy, sell and discover great deals.",
    },
};