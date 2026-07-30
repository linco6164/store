"use client";

import { Suspense } from "react";
import ForgotPasswordContent from "./ForgotPasswordContent";

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex h-screen items-center justify-center">
                    Loading...
                </div>
            }
        >
            <ForgotPasswordContent />
        </Suspense>
    );
}