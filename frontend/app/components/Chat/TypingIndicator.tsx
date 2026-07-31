"use client";

import Image from "next/image";

interface Props {
    username?: string;
    avatar?: string;
}

export default function TypingIndicator({
    username,
    avatar,
}: Props) {
    return (
        <div className="flex items-end gap-2 px-4 py-2">

            <Image
                src={
                    avatar ||
                    "/images/default-avatar.png"
                }
                alt={username || "User"}
                width={32}
                height={32}
                className="rounded-full object-cover"
            />

            <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-3">

                {username && (
                    <p className="mb-1 text-xs font-medium text-gray-500">
                        {username}
                    </p>
                )}

                <div className="flex items-center gap-1">

                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.3s]" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:-0.15s]" />

                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500" />

                </div>

            </div>

        </div>
    );
}