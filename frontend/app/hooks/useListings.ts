import { useEffect, useState } from "react";

import { Listing } from "@/app/types/listing";
import { listingService } from "../services/listing.service";

export function useListings() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const data = await listingService.getAll();
                setListings(data);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    return {
        listings,
        loading,
    };
}