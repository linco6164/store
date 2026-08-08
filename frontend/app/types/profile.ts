import { Listing } from "./listing";
import { User } from "./user";

export interface Profile {
    user: User;

    stats: {
        listings: number;
        sold: number;
        favorites: number;
    };

    listings: Listing[];
}

export interface PublicProfile {
    user: {
        _id: string;
        username: string;
        fullName?: string;
        avatar?: string;
        bio?: string;
        city?: string;
        country?: string;
        createdAt?: string;
    };

    stats: {
        listings: number;
        sold: number;
        favorites: number;
    };

    listings: Listing[];
}