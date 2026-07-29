import { api } from "../lib/api";

import { ENDPOINTS } from "../lib/endpoints";

import { Profile } from "../types/profile";
import { ProfileFormData } from "../profile/edit/schema";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

interface ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}

export const profileService = {
    async getProfile(): Promise<Profile> {
        const { data } = await api.get<ApiResponse<Profile>>(
            ENDPOINTS.PROFILE.ME
        );

        return data.data;
    },

    async updateProfile(
        payload: ProfileFormData
    ): Promise<Profile> {
        const { data } = await api.patch<ApiResponse<Profile>>(
            ENDPOINTS.PROFILE.ME,
            payload
        );

        return data.data;
    },

    async changePassword(
        payload: ChangePasswordDto
    ): Promise<void> {
        await api.patch(
            ENDPOINTS.PROFILE.CHANGE_PASSWORD,
            payload
        );
    },
};