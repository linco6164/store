import { api } from "@/lib/api";
import {
    setToken,
    removeToken,
    getToken,
} from "@/lib/auth";

export interface AuthUser {
    _id: string;
    username: string;
    email: string;
    avatar?: string;
    fullName?: string;
    phone?: string;
    bio?: string;
    country?: string;
    city?: string;
    county?: string;
    postalCode?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
}

interface LoginResponse {
    success: boolean;
    token: string;
    user: AuthUser;
    message?: string;
}

interface RegisterResponse {
    success: boolean;
    token: string;
    user: AuthUser;
    message?: string;
}

interface MeResponse {
    success: boolean;
    data: AuthUser;
    message?: string;
}

export const authService = {
    async login(
        payload: LoginPayload
    ): Promise<AuthUser> {
        const response =
            await api.post<LoginResponse>(
                "/auth/login",
                payload
            );

        const data = response.data;

        if (
            !data.success ||
            !data.token ||
            !data.user
        ) {
            throw new Error(
                data.message ||
                    "Login failed."
            );
        }

        await setToken(data.token);

        return data.user;
    },

    async register(
        payload: RegisterPayload
    ): Promise<AuthUser> {
        const response =
            await api.post<RegisterResponse>(
                "/auth/register",
                payload
            );

        const data = response.data;

        if (
            !data.success ||
            !data.token ||
            !data.user
        ) {
            throw new Error(
                data.message ||
                    "Registration failed."
            );
        }

        await setToken(data.token);

        return data.user;
    },

    async me(): Promise<AuthUser | null> {
        const token =
            await getToken();

        if (!token) {
            return null;
        }

        try {
            const response =
                await api.get<MeResponse>(
                    "/auth/me"
                );

            const data =
                response.data;

            if (
                !data.success ||
                !data.data
            ) {
                return null;
            }

            return data.data;
        } catch (error) {
            /*
             * Token invalid / expired.
             */
            await removeToken();

            throw error;
        }
    },

    async logout(): Promise<void> {
        await removeToken();
    },
};