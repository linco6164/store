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