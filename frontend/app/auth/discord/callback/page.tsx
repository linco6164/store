"use client";

import { Suspense } from "react";
import DiscordCallbackContent from "./DiscordCallbackContent";

export default function DiscordCallbackPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen items-center justify-center">
                    Loading...
                </div>
            }
        >
            <DiscordCallbackContent />
        </Suspense>
    );
}