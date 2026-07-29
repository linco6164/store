"use client";

import { useEffect, useState } from "react";

import ProfileHeader from "../components/Profile/ProfileHeader";
import ProfileStats from "../components/Profile/ProfileStats";
import ProfileTabs, { ProfileTab } from "../components/Profile/ProfileTabs";
import MyListings from "../components/Profile/MyListings";
import FavoriteListings from "../components/Profile/FavoriteListings";
import SoldListings from "../components/Profile/SoldListings";

import { profileService } from "@/app/services/profile.service";
import { Profile } from "@/app/types/profile";

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [activeTab, setActiveTab] = useState<ProfileTab>("listings");

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const data = await profileService.getProfile();
            setProfile(data);
        } catch (error) {
            console.error(error);
        }
    }

    if (!profile) {
        return null;
    }

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

            {activeTab === "sold" && (
                <SoldListings listings={[]} />
            )}

        </div>
    );
}