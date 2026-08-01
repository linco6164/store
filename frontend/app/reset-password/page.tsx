"use client";

import { Suspense } from "react";
import ResetPasswordContent from "./ResetPasswordContent";
import FullPageLoader from "../components/Feedback/FullPageLoader";

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <FullPageLoader label="Se pregătește formularul…" />
            }
        >
            <ResetPasswordContent />
        </Suspense>
    );
}
