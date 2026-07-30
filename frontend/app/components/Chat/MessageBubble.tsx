"use client";

import { Message } from "../../types/chat";
import clsx from "clsx";

interface MessageBubbleProps {
    message: Message;
    currentUserId?: string;
}

export default function MessageBubble({
    message,
    currentUserId,
}: MessageBubbleProps) {
    const isMine =
        message.sender._id === currentUserId;

    return (
        <div
            className={clsx(
                "flex",
                isMine
                    ? "justify-end"
                    : "justify-start"
            )}
        >
            <div
                className={clsx(
                    "max-w-[75%] rounded-2xl px-4 py-2 shadow-sm",
                    isMine
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                )}
            >
                {message.images.length > 0 && (
                    <div className="mb-2 grid grid-cols-2 gap-2">
                        {message.images.map((image) => (
                            <img
                                key={image}
                                src={image}
                                alt=""
                                className="rounded-lg object-cover"
                            />
                        ))}
                    </div>
                )}

                {message.text && (
                    <p className="break-words whitespace-pre-wrap">
                        {message.text}
                    </p>
                )}

                <div
                    className={clsx(
                        "mt-2 text-[11px]",
                        isMine
                            ? "text-blue-100"
                            : "text-gray-500"
                    )}
                >
                    {new Date(
                        message.createdAt
                    ).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            </div>
        </div>
    );
}