import { Suspense } from "react";
import TwoFactorContent from "./TwoFactorContent";
import FullPageLoader from "../../components/Feedback/FullPageLoader";

export default function Page() {
    return (
        <Suspense fallback={<FullPageLoader label="Se pregătește verificarea…" />}>
            <TwoFactorContent />
        </Suspense>
    );
}
