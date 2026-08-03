import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./providers/AuthProvider";
import QueryProvider from "./providers/QueryProviders";

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
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