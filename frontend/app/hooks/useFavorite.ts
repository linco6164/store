"use client";

import { useCallback, useEffect, useState } from "react";

import { favoriteService } from "@/app/services/favorite.service";

interface UseFavoriteResult {
    favorite: boolean;
    loading: boolean;
    toggling: boolean;
    toggle: () => Promise<void>;
}

export function useFavorite(
    listingId: string,
    initialFavorite = false
): UseFavoriteResult {
    const [favorite, setFavorite] =
        useState(initialFavorite);

    const [loading, setLoading] =
        useState(true);

    const [toggling, setToggling] =
        useState(false);

    useEffect(() => {
        let cancelled = false;

        async function checkFavorite() {
            try {
                const result =
                    await favoriteService.check(
                        listingId
                    );

                if (!cancelled) {
                    setFavorite(result);
                }
            } catch {
                if (!cancelled) {
                    setFavorite(false);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void checkFavorite();

        return () => {
            cancelled = true;
        };
    }, [listingId]);

    const toggle = useCallback(async () => {
        if (toggling) {
            return;
        }

        // Optimistic UI
        const previousState = favorite;

        setFavorite(!previousState);
        setToggling(true);

        try {
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

            // Rollback
            setFavorite(previousState);
        } finally {
            setToggling(false);
        }
    }, [
        favorite,
        listingId,
        toggling,
    ]);

    return {
        favorite,
        loading,
        toggling,
        toggle,
    };
}