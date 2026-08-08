"use client";

import { useEffect, useMemo, useState } from "react";

import {
    Package,
    Heart,
    ShoppingBag,
} from "lucide-react";

import ProfileHeader from "../../components/Profile/ProfileHeader";
import ProfileStats from "../../components/Profile/ProfileStats";
import ProfileTabs, {
    ProfileTab,
} from "../../components/Profile/ProfileTabs";
import MyListings from "../../components/Profile/MyListings";
import FavoriteListings from "../../components/Profile/FavoriteListings";
import SoldListings from "../../components/Profile/SoldListings";
import RetryState from "../../components/Feedback/RetryState";
import ProfileSkeleton from "./loading";

import { profileService } from "@/app/services/profile.service";
import { Profile } from "@/app/types/profile";

import { useFavorites } from "@/app/hooks/useFavorites";

export default function ProfilePage() {
    const [profile, setProfile] =
        useState<Profile | null>(null);

    const [activeTab, setActiveTab] =
        useState<ProfileTab>("listings");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState(false);

    const [retryCount, setRetryCount] =
        useState(0);

    const {
        favorites,
        loading: favoritesLoading,
        reload: reloadFavorites,
    } = useFavorites();

    useEffect(() => {
        let cancelled = false;

        async function loadProfile() {
            try {
                setLoading(true);

                const data =
                    await profileService.getProfile();

                if (!cancelled) {
                    setProfile(data);
                    setError(false);
                }
            } catch (loadError) {
                console.error(loadError);

                if (!cancelled) {
                    setError(true);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void loadProfile();

        return () => {
            cancelled = true;
        };
    }, [retryCount]);

    function retry() {
        setLoading(true);
        setError(false);

        setRetryCount(
            (count) => count + 1
        );

        void reloadFavorites();
    }

    const soldListings = useMemo(() => {
        if (!profile) {
            return [];
        }

        return profile.listings.filter(
            (listing) =>
                listing.status === "sold"
        );
    }, [profile]);

    const favoriteListings = useMemo(() => {
        return favorites
            .map((favorite) => {
                return (
                    favorite.listing ??
                    favorite
                );
            })
            .filter(Boolean);
    }, [favorites]);

    if (loading) {
        return <ProfileSkeleton />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 py-10">
                <div className="mx-auto max-w-7xl">
                    <RetryState
                        message="Profilul nu a putut fi încărcat."
                        onRetry={retry}
                    />
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

                {/* Profile header */}

                <section className="overflow-hidden rounded-[2rem] border border-gray-200/80 bg-white shadow-sm">
                    <ProfileHeader
                        user={profile.user}
                    />
                </section>

                {/* Stats */}

                <section className="mt-5">
                    <ProfileStats
                        stats={{
                            ...profile.stats,
                            favorites:
                                favorites.length,
                            sold:
                                soldListings.length,
                        }}
                    />
                </section>

                {/* Main content */}

                <section className="mt-8 overflow-hidden rounded-[2rem] border border-gray-200/80 bg-white shadow-sm">

                    {/* Tabs */}

                    <div className="border-b border-gray-100 px-4 sm:px-6">
                        <ProfileTabs
                            active={activeTab}
                            onChange={setActiveTab}
                        />
                    </div>

                    {/* Content */}

                    <div className="p-5 sm:p-6 lg:p-8">

                        {/* Listings */}

                        {activeTab ===
                            "listings" && (
                            <div className="space-y-6">

                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <Package
                                                size={20}
                                                className="text-gray-500"
                                            />

                                            <h2 className="text-xl font-bold text-gray-900">
                                                My listings
                                            </h2>
                                        </div>

                                        <p className="mt-1 text-sm text-gray-500">
                                            Produsele pe care le ai
                                            publicate.
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                                        {
                                            profile.stats
                                                .listings
                                        }{" "}
                                        listings
                                    </span>
                                </div>

                                <MyListings
                                    listings={
                                        profile.listings
                                    }
                                />
                            </div>
                        )}

                        {/* Favorites */}

                        {activeTab ===
                            "favorites" && (
                            <div className="space-y-6">

                                <div>
                                    <div className="flex items-center gap-2">
                                        <Heart
                                            size={20}
                                            className="text-red-500"
                                        />

                                        <h2 className="text-xl font-bold text-gray-900">
                                            Favorites
                                        </h2>
                                    </div>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Produsele pe care le-ai
                                        salvat.
                                    </p>
                                </div>

                                {favoritesLoading ? (
                                    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
                                        {Array.from(
                                            {
                                                length: 4,
                                            }
                                        ).map(
                                            (_, index) => (
                                                <div
                                                    key={
                                                        index
                                                    }
                                                    className="aspect-[3/4] animate-pulse rounded-3xl bg-gray-100"
                                                />
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <FavoriteListings
                                        listings={
                                            favoriteListings
                                        }
                                    />
                                )}
                            </div>
                        )}

                        {/* Sold */}

                        {activeTab ===
                            "sold" && (
                            <div className="space-y-6">

                                <div>
                                    <div className="flex items-center gap-2">
                                        <ShoppingBag
                                            size={20}
                                            className="text-emerald-600"
                                        />

                                        <h2 className="text-xl font-bold text-gray-900">
                                            Sold listings
                                        </h2>
                                    </div>

                                    <p className="mt-1 text-sm text-gray-500">
                                        Produsele pe care le-ai
                                        vândut.
                                    </p>
                                </div>

                                <SoldListings
                                    listings={
                                        soldListings
                                    }
                                />
                            </div>
                        )}

                    </div>
                </section>

            </div>
        </main>
    );
}