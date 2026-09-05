"use client";

import { Heart } from "lucide-react";
import HeaderIconButton from "./HeaderIconButton";

interface Props {
    count?: number;
    active?: boolean;
    onClick?: () => void;
}

export default function FavoritesButton({
    count,
    active,
    onClick,
}: Props) {
    return (
        <HeaderIconButton
            icon={
                <Heart
                    size={21}
                    fill={
                        active
                            ? "currentColor"
                            : "none"
                    }
                />
            }
            tooltip="Favorite"
            count={count}
            active={active}
            danger
            onClick={onClick}
        />
    );
}