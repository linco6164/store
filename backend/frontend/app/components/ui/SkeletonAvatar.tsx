"use client";

import Skeleton from "./Skeleton";

interface Props {
    size?: number;
}

export default function SkeletonAvatar({
    size = 48,
}: Props) {
    return (
        <div
            style={{
                width: size,
                height: size,
            }}
        >
            <Skeleton rounded="full" className="w-full h-full" />
        </div>
    );
}