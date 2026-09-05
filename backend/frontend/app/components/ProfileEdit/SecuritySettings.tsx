"use client";

import ChangePassword from "./ChangePassword";
import TwoFactorCard from "./TwoFactorCard";

interface SecuritySettingsProps {
    twoFactorEnabled: boolean;
    onRefresh: () => void;
}

export default function SecuritySettings({
    twoFactorEnabled,
    onRefresh,
}: SecuritySettingsProps) {
    return (
        <section className="space-y-6">

            <div>
                <h2 className="text-2xl font-bold">
                    Securitate
                </h2>

                <p className="mt-2 text-gray-500">
                    Gestionează parola, autentificarea în doi pași și dispozitivele de conectare.
                </p>
            </div>

            <ChangePassword />

            <TwoFactorCard
                enabled={twoFactorEnabled}
                onEnabled={onRefresh}
            />

        </section>
    );
}