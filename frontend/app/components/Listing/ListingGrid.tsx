"use client";

import { Listing } from "@/app/types/listing";

import ListingCard from "./ListingCard";
import ListingSkeleton from "./ListingSkeleton";

import EmptyState from "../ui/EmptyState";
import Pagination from "../ui/Pagination";

interface Props {
    listings: Listing[];

    loading?: boolean;

    page?: number;

    totalPages?: number;

    onPageChange?: (page: number) => void;

    emptyTitle?: string;

    emptyDescription?: string;
}

export default function ListingGrid({
    listings,

    loading = false,

    page = 1,

    totalPages = 1,

    onPageChange,

    emptyTitle = "Nu există anunțuri",

    emptyDescription = "Momentan nu există rezultate.",
}: Props) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({
                    length: 8,
                }).map((_, index) => (
                    <ListingSkeleton
                        key={index}
                    />
                ))}
            </div>
        );
    }

    if (listings.length === 0) {
        return (
            <EmptyState
                title={emptyTitle}
                description={emptyDescription}
            />
        );
    }

    return (
        <div className="space-y-8">

            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">

                {listings.map((listing) => (
                    <ListingCard
                        key={listing._id}
                        listing={listing}
                    />
                ))}

            </div>

            {totalPages > 1 &&
                onPageChange && (
                    <Pagination
                        page={page}
                        totalPages={
                            totalPages
                        }
                        onChange={
                            onPageChange
                        }
                    />
                )}

        </div>
    );
}