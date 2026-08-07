"use client";

import { Heart, Share2, Flag, Link2 } from "lucide-react";
import { notify } from "@/app/lib/notify";

import Button from "@/app/components/ui/Button";

interface Props {
    listingId: string;
    favorite?: boolean;
    onFavorite?(): void;
}

export default function ProductActions({
    listingId,
    favorite = false,
    onFavorite,
}: Props) {
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
                onClick={onFavorite}
            >
                <Heart size={20} />

                {favorite
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