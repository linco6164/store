// app/types/listing-preview.ts

import { ListingCondition } from "./listing";

export interface ListingPreview {
    title: string;
    category: string;
    condition: ListingCondition;
    price: number;
    city: string;
    description: string;
    images: File[];
}