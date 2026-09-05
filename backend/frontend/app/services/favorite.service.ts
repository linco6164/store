import { api } from "@/app/lib/api";
import { ENDPOINTS } from "@/app/lib/endpoints";
import { Listing } from "@/app/types/listing";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface FavoriteListing {
    _id: string;
    listing: Listing;
    createdAt: string;
    updatedAt: string;
}

export interface FavoriteState {
    favorite: boolean;
}

export const favoriteService = {
    async getAll(): Promise<FavoriteListing[]> {
        const { data } =
            await api.get<ApiResponse<FavoriteListing[]>>(
                ENDPOINTS.FAVORITES.GET_ALL
            );

        return data.data;
    },

    async check(
        listingId: string
    ): Promise<boolean> {
        const { data } =
            await api.get<ApiResponse<boolean>>(
                ENDPOINTS.FAVORITES.CHECK(
                    listingId
                )
            );

        return data.data;
    },

    async add(
        listingId: string
    ) {
        const { data } =
            await api.post<ApiResponse<unknown>>(
                ENDPOINTS.FAVORITES.ADD(
                    listingId
                )
            );

        return data.data;
    },

    async remove(
        listingId: string
    ) {
        const { data } =
            await api.delete<ApiResponse<unknown>>(
                ENDPOINTS.FAVORITES.REMOVE(
                    listingId
                )
            );

        return data.data;
    },

    async toggle(
        listingId: string
    ): Promise<FavoriteState> {
        const { data } =
            await api.post<
                ApiResponse<FavoriteState>
            >(
                ENDPOINTS.FAVORITES.TOGGLE(
                    listingId
                )
            );

        return data.data;
    },
};