"use client";

import {
    useCallback,
    useState,
} from "react";

import { favoriteService } from "@/app/services/favorite.service";

interface UseFavoriteResult {
    favorite: boolean;
    loading: boolean;
    toggling: boolean;
    toggle: () => Promise<void>;
}

export default function useFavorite(
    listingId: string,
    initialFavorite = false
): UseFavoriteResult {
    const [favorite, setFavorite] =
        useState(initialFavorite);

    const [loading, setLoading] =
        useState(false);

    const [toggling, setToggling] =
        useState(false);

    const toggle = useCallback(async () => {
        if (toggling) {
            return;
        }

        try {
            setToggling(true);

            const result =
                await favoriteService.toggle(
                    listingId
                );

            setFavorite(result.favorite);
        } catch (error) {
            console.error(
                "Failed to toggle favorite:",
                error
            );
        } finally {
            setToggling(false);
        }
    }, [listingId, toggling]);

    return {
        favorite,
        loading,
        toggling,
        toggle,
    };
}