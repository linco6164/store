"use client";

import { useEffect, useState } from "react";

import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileStats from "../components/Profile/ProfileStats";
import ProfileTabs, { ProfileTab } from "../components/Profile/ProfileTabs";
import MyListings from "../components/Profile/MyListings";
import FavoriteListings from "../components/Profile/FavoriteListings";
import SoldListings from "../components/Profile/SoldListings";
import RetryState from "../components/Feedback/RetryState";
import ProfileSkeleton from "./loading";
import { profileService } from "@/app/services/profile.service";
import { Profile } from "@/app/types/profile";

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [activeTab, setActiveTab] = useState<ProfileTab>("listings");
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

    if (loading) return <ProfileSkeleton />;

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
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
            <ProfileHeader user={profile.user} />
            <ProfileStats stats={profile.stats} />
            <ProfileTabs
                active={activeTab}
                onChange={setActiveTab}
            />

            {activeTab === "listings" && (
                <MyListings listings={profile.listings} />
            )}
            {activeTab === "favorites" && (
                <FavoriteListings listings={[]} />
            )}
            {activeTab === "sold" && <SoldListings listings={[]} />}
        </div>
    );
}
