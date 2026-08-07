export const listingConditions = [
    "new",
    "like_new",
    "good",
    "fair",
] as const;

export type ListingCondition =
    typeof listingConditions[number];

export interface Listing {
    _id: string;

    title: string;
    description: string;

    category: string;
    subcategory?: string;

    condition: ListingCondition;

    price: number;
    currency: "RON";

    negotiable: boolean;

    city: string;

    images: string[];

    brand?: string;
    color?: string;
    size?: string;

    shipping: boolean;

    favorite: boolean;

    favorites: number;

    views: number;

    status:
        | "active"
        | "reserved"
        | "sold"
        | "hidden";

    createdAt: string;

    seller: {
        _id: string;
        username: string;
        avatar: string;
    };
}