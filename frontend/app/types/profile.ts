import { Listing } from "./listing";

export interface Profile {
    user: {
        _id: string;
        username: string;
        email: string;
        avatar: string;
        createdAt: string;
    };

    stats: {
        listings: number;
        sold: number;
        favorites: number;
    };

    listings: Listing[];
}