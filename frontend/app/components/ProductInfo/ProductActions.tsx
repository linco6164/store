"use client";

import {
    Heart,
    Share2,
    Flag,
    Link2,
} from "lucide-react";

import { notify } from "@/app/lib/notify";
import Button from "@/app/components/ui/Button";
import { useFavorite } from "@/app/hooks/useFavorite";

interface Props {
    listingId: string;
}

export default function ProductActions({
    listingId,
}: Props) {
    const {
        favorite,
        loading,
        toggling,
        toggle,
    } = useFavorite(listingId);

    async function handleFavorite() {
        try {
            await toggle();

            notify.success(
                favorite
                    ? "Removed from favorites"
                    : "Saved to favorites",
                favorite
                    ? "Listing removed from your favorites."
                    : "Listing added to your favorites."
            );
        } catch (error) {
            console.error(error);

            notify.error(
                "Something went wrong",
                "The listing could not be updated."
            );
        }
    }

    async function handleShare() {
        if (navigator.share) {
            await navigator.share({
                title: "Nexora Marketplace",
                url: window.location.href,
            });

            return;
        }

        await navigator.clipboard.writeText(
            window.location.href
        );

        notify.success(
            "Link copied",
            "Listing URL copied to clipboard."
        );
    }

    async function handleCopyLink() {
        await navigator.clipboard.writeText(
            window.location.href
        );

        notify.success(
            "Link copied",
            "You can now share it."
        );
    }

    function handleReport() {
        notify.info(
            "Report submitted",
            "We'll review this listing shortly."
        );
    }

    return (
        <div className="space-y-3">
            <Button
                variant={
                    favorite
                        ? "primary"
                        : "outline"
                }
                size="lg"
                className="w-full"
                onClick={handleFavorite}
                disabled={loading || toggling}
            >
                <Heart
                    size={20}
                    className={
                        favorite
                            ? "fill-current"
                            : ""
                    }
                />

                {toggling
                    ? "Saving..."
                    : favorite
                      ? "Saved"
                      : "Save Listing"}
            </Button>

            <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleShare}
            >
                <Share2 size={20} />

                Share
            </Button>

            <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={handleCopyLink}
            >
                <Link2 size={20} />

                Copy Link
            </Button>

            <Button
                variant="ghost"
                size="lg"
                className="w-full text-red-600 hover:bg-red-50"
                onClick={handleReport}
            >
                <Flag size={20} />

                Report Listing
            </Button>
        </div>
    );
}