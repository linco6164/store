"use client";

import { Suspense } from "react";
import DiscordCallbackContent from "./DiscordCallbackContent";
import FullPageLoader from "../../../components/Feedback/FullPageLoader";

export default function DiscordCallbackPage() {
    return (
        <Suspense
            fallback={
                <FullPageLoader label="Se conectează contul Discord…" />
            }
        >
            <DiscordCallbackContent />
        </Suspense>
    );
}
