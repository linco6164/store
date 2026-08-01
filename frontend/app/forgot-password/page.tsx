"use client";

import { Suspense } from "react";
import ForgotPasswordContent from "./ForgotPasswordContent";
import FullPageLoader from "../components/Feedback/FullPageLoader";

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <FullPageLoader label="Se pregătește formularul…" />
            }
        >
            <ForgotPasswordContent />
        </Suspense>
    );
}
