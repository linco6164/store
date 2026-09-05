import { api } from "@/app/lib/api";
import { ENDPOINTS } from "@/app/lib/endpoints";
import { Listing } from "@/app/types/listing";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ListingFilters {
    search?: string;

    category?: string;
    subcategory?: string;

    city?: string;

    condition?: string;

    minPrice?: number;
    maxPrice?: number;

    shipping?: boolean;
    negotiable?: boolean;

    sort?:
        | "newest"
        | "oldest"
        | "price_asc"
        | "price_desc"
        | "views"
        | "favorites";
}

export interface CreateListingDto {
    title: string;
    description: string;

    category: string;
    subcategory?: string;

    condition: string;

    price: number;
    currency?: "RON";

    negotiable?: boolean;

    city: string;

    images: string[];

    brand?: string;
    color?: string;
    size?: string;

    shipping?: boolean;
}

export class ListingService {
    async getAll(): Promise<Listing[]> {
        const { data } =
            await api.get<ApiResponse<Listing[]>>(
                ENDPOINTS.LISTINGS.GET_ALL
            );

        return data.data;
    }

    async getOne(id: string): Promise<Listing> {
        const { data } =
            await api.get<ApiResponse<Listing>>(
                ENDPOINTS.LISTINGS.GET_ONE(id)
            );

        return data.data;
    }

    async search(
        filters: ListingFilters
    ): Promise<Listing[]> {
        const params =
            new URLSearchParams();

        Object.entries(filters).forEach(
            ([key, value]) => {
                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {
                    params.append(
                        key,
                        String(value)
                    );
                }
            }
        );

        const { data } =
            await api.get<ApiResponse<Listing[]>>(
                `${ENDPOINTS.LISTINGS.SEARCH}?${params.toString()}`
            );

        return data.data;
    }

    async create(
        payload: CreateListingDto
    ) {
        const { data } =
            await api.post<ApiResponse<Listing>>(
                ENDPOINTS.LISTINGS.CREATE,
                payload
            );

        return data.data;
    }

    async update(
        id: string,
        payload: Partial<CreateListingDto>
    ) {
        const { data } =
            await api.patch<ApiResponse<Listing>>(
                ENDPOINTS.LISTINGS.UPDATE(
                    id
                ),
                payload
            );

        return data.data;
    }

    async remove(id: string) {
        const { data } =
            await api.delete<ApiResponse<void>>(
                ENDPOINTS.LISTINGS.DELETE(
                    id
                )
            );

        return data;
    }
}

export const listingService =
    new ListingService();