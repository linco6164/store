import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const TOKEN_KEY = "nexora_access_token";

async function getToken() {
    return SecureStore.getItemAsync(TOKEN_KEY);
}

async function request<T>(
    method: "get" | "post" | "delete",
    path: string
): Promise<T> {
    if (!API_URL) {
        throw new Error(
            "EXPO_PUBLIC_API_URL nu este configurat."
        );
    }

    const token = await getToken();

    const response = await axios.request<T>({
        method,
        url: `${API_URL}${path}`,
        timeout: 30000,
        headers: {
            "Content-Type": "application/json",

            ...(token
                ? {
                      Authorization:
                          `Bearer ${token}`,
                  }
                : {}),
        },
    });

    return response.data;
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface FavoriteState {
    favorite: boolean;
}

export const favoriteService = {
    async getAll() {
        const response =
            await request<
                ApiResponse<any[]>
            >(
                "get",
                "/favorites"
            );

        return response.data;
    },

    async check(
        listingId: string
    ): Promise<boolean> {
        const response =
            await request<
                ApiResponse<boolean>
            >(
                "get",
                `/favorites/check/${listingId}`
            );

        return response.data;
    },

    async add(
        listingId: string
    ) {
        const response =
            await request<
                ApiResponse<unknown>
            >(
                "post",
                `/favorites/${listingId}`
            );

        return response.data;
    },

    async remove(
        listingId: string
    ) {
        const response =
            await request<
                ApiResponse<unknown>
            >(
                "delete",
                `/favorites/${listingId}`
            );

        return response.data;
    },

    async toggle(
        listingId: string
    ): Promise<FavoriteState> {
        const response =
            await request<
                ApiResponse<FavoriteState>
            >(
                "post",
                `/favorites/${listingId}/toggle`
            );

        return response.data;
    },
};