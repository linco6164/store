"use client";

import { useEffect, useState } from "react";

import ProfileForm from "../../components/ProfileEdit/ProfileForm";
import RetryState from "../../components/Feedback/RetryState";
import EditProfileSkeleton from "./loading";
import { profileService } from "../../services/profile.service";
import { Profile } from "../../types/profile";

export default function EditProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            try {
                const data = await profileService.getProfile();
                if (!cancelled) {
                    setProfile(data);
                    setError(false);
                }
            } catch (loadError) {
                console.error(loadError);
                if (!cancelled) setError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        void loadProfile();

        return () => {
            cancelled = true;
        };
    }, [retryCount]);

    function retry() {
        setLoading(true);
        setError(false);
        setRetryCount((count) => count + 1);
    }

    if (loading) return <EditProfileSkeleton />;

    if (error) {
        return (
            <RetryState
                message="Profilul nu a putut fi încărcat."
                onRetry={retry}
            />
        );
    }

    if (!profile) return null;

    return (
        <main className="mx-auto max-w-4xl px-4 py-10">
            <div className="mb-8">
                <h1 className="text-4xl font-bold">
                    Editează profilul
                </h1>
                <p className="mt-2 text-gray-500">
                    Actualizează informațiile contului tău.
                </p>
            </div>

            <ProfileForm
                user={{
                    ...profile.user,
                    twoFactorEnabled: false,
                }}
            />
        </main>
    );
}
