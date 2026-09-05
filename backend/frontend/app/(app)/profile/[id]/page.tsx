import { notFound } from "next/navigation";
import {
    MapPin,
    Package,
    CheckCircle2,
} from "lucide-react";

import { profileService } from "@/app/services/profile.service";
import { ListingGrid } from "@/app/components/Listing";

type PageProps = {
    params: Promise<{
        id: string;
    }>;
};

export default async function PublicProfilePage({
    params,
}: PageProps) {
    const { id } = await params;

    try {
        const profile =
            await profileService.getPublicProfile(id);

        if (!profile) {
            notFound();
        }

        const { user, stats, listings } =
            profile;

        return (
            <main className="min-h-screen bg-gray-50">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

                    {/* Profile Header */}
                    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                        <div className="h-32 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 sm:h-40" />

                        <div className="px-6 pb-7 sm:px-8">

                            <div className="-mt-14 flex flex-col gap-6 sm:-mt-16 sm:flex-row sm:items-end sm:justify-between">

                                <div className="flex items-end gap-5">

                                    {/* Avatar */}
                                    <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-gray-100 shadow-lg sm:h-32 sm:w-32">
                                        {user.avatar ? (
                                            <img
                                                src={
                                                    user.avatar
                                                }
                                                alt={
                                                    user.username
                                                }
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-gray-400">
                                                {user.username
                                                    ?.charAt(
                                                        0
                                                    )
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    <div className="pb-1">

                                        <div className="flex items-center gap-2">
                                            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                                                {
                                                    user.username
                                                }
                                            </h1>

                                            <CheckCircle2
                                                size={
                                                    20
                                                }
                                                className="text-blue-500"
                                            />
                                        </div>

                                        {user.city && (
                                            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                                                <MapPin
                                                    size={
                                                        15
                                                    }
                                                />

                                                {
                                                    user.city
                                                }

                                                {user.country &&
                                                    `, ${user.country}`}
                                            </div>
                                        )}

                                    </div>
                                </div>

                                {/* Message button */}
                                <button
                                    type="button"
                                    className="rounded-2xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                                >
                                    Message
                                </button>

                            </div>

                            {/* Bio */}
                            {user.bio && (
                                <p className="mt-6 max-w-2xl text-sm leading-6 text-gray-600">
                                    {user.bio}
                                </p>
                            )}

                            {/* Stats */}
                            <div className="mt-7 grid grid-cols-3 divide-x rounded-2xl border border-gray-100 bg-gray-50">

                                <div className="px-4 py-4 text-center">
                                    <div className="text-xl font-bold text-gray-900">
                                        {
                                            stats.listings
                                        }
                                    </div>

                                    <div className="mt-1 text-xs text-gray-500">
                                        Active listings
                                    </div>
                                </div>

                                <div className="px-4 py-4 text-center">
                                    <div className="text-xl font-bold text-gray-900">
                                        {
                                            stats.sold
                                        }
                                    </div>

                                    <div className="mt-1 text-xs text-gray-500">
                                        Sold
                                    </div>
                                </div>

                                <div className="px-4 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1 text-xl font-bold text-gray-900">
                                        <Package
                                            size={
                                                18
                                            }
                                        />

                                        {
                                            stats.listings
                                        }
                                    </div>

                                    <div className="mt-1 text-xs text-gray-500">
                                        Items
                                    </div>
                                </div>

                            </div>

                        </div>
                    </section>

                    {/* Listings */}
                    <section className="mt-10">

                        <div className="mb-6 flex items-end justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Active listings
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Items currently for sale
                                </p>
                            </div>

                            <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                                {
                                    listings.length
                                }
                            </span>
                        </div>

                        {listings.length > 0 ? (
                            <ListingGrid
                                listings={
                                    listings
                                }
                            />
                        ) : (
                            <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                                    <Package
                                        size={
                                            24
                                        }
                                        className="text-gray-400"
                                    />
                                </div>

                                <h3 className="mt-5 text-lg font-semibold text-gray-900">
                                    No active listings
                                </h3>

                                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                                    This seller doesn't
                                    have any active
                                    listings right now.
                                </p>
                            </div>
                        )}

                    </section>
                </div>
            </main>
        );
    } catch (error) {
        console.error(
            "Failed to load public profile:",
            error
        );

        notFound();
    }
}