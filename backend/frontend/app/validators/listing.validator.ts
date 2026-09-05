import { z } from "zod";
import { listingConditions } from "@/app/types/listing";

export const listingSchema = z.object({
    title: z.string().min(5),

    category: z.string(),

    condition: z.enum(listingConditions),

    price: z.number(),

    city: z.string(),

    description: z.string(),

    images: z.array(z.instanceof(File)),
});

export type ListingForm = z.infer<typeof listingSchema>;