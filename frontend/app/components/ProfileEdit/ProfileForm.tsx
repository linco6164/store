"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import AvatarUploader from "./AvatarUpload";
import PersonalInfo from "./PersonalInfo";
import AddressForm from "./AddressForm";
import SaveBar from "./SaveBar";
import DangerZone from "./DangerZone";
import SocialLinks from "./SocialLinks";
import SecuritySettings from "./SecuritySettings";

import { profileSchema, ProfileFormData } from "../../(app)/profile/edit/schema";

import { profileService } from "../../services/profile.service";
import { toast } from "sonner";

interface Props {
    user: {
        username: string;
        fullName?: string;
        email: string;
        phone?: string;
        bio?: string;
        city?: string;
        country?: string;
        avatar?: string;

        twoFactorEnabled: boolean;
    };
}

export default function ProfileForm({
    user,
}: Props) {
    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),

        defaultValues: {
            username: user.username,
            fullName: user.fullName ?? "",
            email: user.email,
            phone: user.phone ?? "",
            bio: user.bio ?? "",
            city: user.city ?? "",
            country: user.country ?? "",
            avatar: user.avatar ?? "",

        },
    });

    const {
        handleSubmit,
        formState: { isSubmitting },
    } = form;

    async function onSubmit(values: ProfileFormData) {
        try {
            await profileService.updateProfile(values);

            toast.success("Profil actualizat.");

            // TODO:
            // toast.success("Profil actualizat")
        } catch (error) {
            console.error(error);

            toast.error("Profilul nu a putut fi actualizat.");

            // toast.error(...)
        }
    }

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
        >
            <AvatarUploader form={form} />

            <PersonalInfo form={form} />

            <SecuritySettings
                twoFactorEnabled={user.twoFactorEnabled}
                onRefresh={() => window.location.reload()}
            />

            <AddressForm form={form} />

            <SocialLinks form={form} />

            <DangerZone />

            <SaveBar
                loading={isSubmitting}
            />
        </form>
    );
}
