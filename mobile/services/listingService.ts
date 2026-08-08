import axios from "axios";
import * as SecureStore from "expo-secure-store";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL;

const TOKEN_KEY =
    "nexora_access_token";

export interface ListingSeller {
    _id: string;
    username: string;
    avatar?: string;
    verified?: boolean;
    rating?: number;
}

export interface Listing {
    _id: string;

    title: string;
    description?: string;

    price: number;
    currency?: string;

    category?: string;
    city?: string;
    condition?: string;

    images?: string[];

    status?: string;

    views?: number;

    seller?: ListingSeller;

    createdAt?: string;
    updatedAt?: string;
}

interface ListingsResponse {
    success: boolean;
    data: Listing[];
}

interface ListingResponse {
    success: boolean;
    data: Listing;
}

async function getToken() {
    return SecureStore.getItemAsync(
        TOKEN_KEY
    );
}

async function request<T>(
    method:
        | "get"
        | "post"
        | "patch"
        | "delete",
    path: string,
    data?: unknown
): Promise<T> {
    if (!API_URL) {
        throw new Error(
            "EXPO_PUBLIC_API_URL nu este configurat."
        );
    }

    const token =
        await getToken();

    const response =
        await axios.request<T>({
            method,
            url: `${API_URL}${path}`,
            data,
            timeout: 30000,
            headers: {
                "Content-Type":
                    "application/json",

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

export const listingService = {
    /**
     * Toate anunțurile active.
     */
    async getAll() {
        const response =
            await request<ListingsResponse>(
                "get",
                "/listings"
            );

        return response.data;
    },

    /**
     * Un singur anunț.
     */
    async getById(
        id: string
    ) {
        const response =
            await request<ListingResponse>(
                "get",
                `/listings/${id}`
            );

        return response.data;
    },

    /**
     * Căutare și filtrare.
     */
    async search(filters?: {
        category?: string;
        city?: string;
        condition?: string;
        minPrice?: number;
        maxPrice?: number;
    }) {
        const params =
            new URLSearchParams();

        if (filters?.category) {
            params.set(
                "category",
                filters.category
            );
        }

        if (filters?.city) {
            params.set(
                "city",
                filters.city
            );
        }

        if (filters?.condition) {
            params.set(
                "condition",
                filters.condition
            );
        }

        if (
            filters?.minPrice !==
            undefined
        ) {
            params.set(
                "minPrice",
                String(
                    filters.minPrice
                )
            );
        }

        if (
            filters?.maxPrice !==
            undefined
        ) {
            params.set(
                "maxPrice",
                String(
                    filters.maxPrice
                )
            );
        }

        const query =
            params.toString();

        const response =
            await request<ListingsResponse>(
                "get",
                `/listings/search${
                    query
                        ? `?${query}`
                        : ""
                }`
            );

        return response.data;
    },

    /**
     * Creare anunț.
     *
     * Endpoint-ul backend este protejat
     * și folosește utilizatorul din JWT.
     */
    async create(
        data: Partial<Listing>
    ) {
        const response =
            await request<ListingResponse>(
                "post",
                "/listings",
                data
            );

        return response.data;
    },

    /**
     * Actualizare anunț.
     */
    async update(
        id: string,
        data: Partial<Listing>
    ) {
        const response =
            await request<ListingResponse>(
                "patch",
                `/listings/${id}`,
                data
            );

        return response.data;
    },

    /**
     * Ștergere anunț.
     */
    async delete(
        id: string
    ) {
        return request<{
            success: boolean;
            message: string;
        }>(
            "delete",
            `/listings/${id}`
        );
    },

    /**
     * Schimbare status.
     */
    async updateStatus(
        id: string,
        status: string
    ) {
        const response =
            await request<ListingResponse>(
                "patch",
                `/listings/${id}/status`,
                {
                    status,
                }
            );

        return response.data;
    },
};