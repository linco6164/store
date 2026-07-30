import { Suspense } from "react";
import TwoFactorContent from "./TwoFactorContent";

export default function Page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <TwoFactorContent />
        </Suspense>
    );
}