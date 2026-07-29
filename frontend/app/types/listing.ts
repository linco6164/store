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
    price: number;
    city: string;
    description: string;
    category: string;
    condition: ListingCondition;
    images: string[];
    currency: "RON";
    favorite: boolean;
    createdAt: string;
    views?: number;

    seller: {
        _id: string;
        username: string;
        avatar: string;
    };
}