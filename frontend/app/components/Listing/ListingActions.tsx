"use client";

import { Heart, Share2, Flag } from "lucide-react";
import IconButton from "../ui/IconButton";

interface Props {
    favorite?: boolean;
    onFavorite?: () => void;
    onShare?: () => void;
    onReport?: () => void;
}

export default function ListingActions({
    favorite = false,
    onFavorite,
    onShare,
    onReport,
}: Props) {
    return (
        <div className="flex items-center gap-2">

            <IconButton
                icon={
                    <Heart
                        size={18}
                        fill={favorite ? "currentColor" : "none"}
                    />
                }
                onClick={onFavorite}
                variant={favorite ? "danger" : "outline"}
            />

            <IconButton
                icon={<Share2 size={18} />}
                onClick={onShare}
                variant="outline"
            />

            <IconButton
                icon={<Flag size={18} />}
                onClick={onReport}
                variant="outline"
            />

        </div>
    );
}