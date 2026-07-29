"use client";

import { useEffect, useState } from "react";

import ProfileForm from "../../components/ProfileEdit/ProfileForm";

import { profileService } from "../../services/profile.service";
import { Profile } from "../../types/profile";

export default function EditProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);

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
                user={profile.user}
            />

        </main>
    );
}