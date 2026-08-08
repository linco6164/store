"use client";

import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    favoriteService,
    FavoriteListing,
} from "@/app/services/favorite.service";

interface UseFavoritesResult {
    favorites: FavoriteListing[];
    loading: boolean;
    error: boolean;
    reload: () => Promise<void>;
}

export function useFavorites(): UseFavoritesResult {
    const [favorites, setFavorites] = useState<
        FavoriteListing[]
    >([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(false);

    const loadFavorites =
        useCallback(async () => {
            try {
                setLoading(true);
                setError(false);

                const data =
                    await favoriteService.getAll();

                setFavorites(data);
            } catch (error) {
                console.error(
                    "Failed to load favorites:",
                    error
                );

                setFavorites([]);
                setError(true);
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        void loadFavorites();
    }, [loadFavorites]);

    return {
        favorites,
        loading,
        error,
        reload: loadFavorites,
    };
}