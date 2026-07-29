import { api } from "@/app/lib/api";
import { ENDPOINTS } from "@/app/lib/endpoints";
import { Listing } from "@/app/types/listing";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export class ListingService {
    async getAll(): Promise<Listing[]> {
        const { data } = await api.get<ApiResponse<Listing[]>>(
            ENDPOINTS.LISTINGS.GET_ALL
        );

        return data.data;
    }

    async getOne(id: string): Promise<Listing> {
        const { data } = await api.get<ApiResponse<Listing>>(
            ENDPOINTS.LISTINGS.GET_ONE(id)
        );

        return data.data;
    }

    async create(data: {
        title: string;
        description: string;
        category: string;
        condition: string;
        price: number;
        city: string;
        images: string[];
    }) {
        const response = await api.post(
            ENDPOINTS.LISTINGS.CREATE,
            data
        );

        return response.data;
    }
}

export const listingService = new ListingService();