"use client";

import Image from "next/image";
import clsx from "clsx";
import { Reply } from "lucide-react";

import { Message } from "../../types/chat";
import MessageStatus from "./MessageStatus";

interface MessageBubbleProps {
    message: Message;
    currentUserId: string;
    showAvatar: boolean;
    showName: boolean;
    onReply?: (message: Message) => void;
}

export default function MessageBubble({
    message,
    currentUserId,
    showAvatar,
    showName,
    onReply,
}: MessageBubbleProps) {
    const isMine =
        message.sender._id === currentUserId;

    const delivered =
        message.deliveredTo.includes(
            currentUserId
        );

    const seen =
        message.seenBy.includes(
            currentUserId
        );

    return (
        <div
            className={clsx(
                "mb-4 flex",
                isMine
                    ? "justify-end"
                    : "justify-start"
            )}
        >
            {!isMine && (
                <div className="mr-3 w-8 flex-shrink-0">
                    {showAvatar ? (
                        <Image
                            src={
                                message.sender.avatar ||
                                "/images/default-avatar.png"
                            }
                            alt={message.sender.username}
                            width={32}
                            height={32}
                            className="rounded-full object-cover"
                        />
                    ) : null}
                </div>
            )}

            <div
                className={clsx(
                    "max-w-[75%]",
                    isMine &&
                    "flex flex-col items-end"
                )}
            >
                {!isMine && showName && (
                    <p className="mb-1 ml-1 text-xs font-semibold text-gray-500">
                        {message.sender.username}
                    </p>
                )}

                <div
                    className={clsx(
                        "group relative rounded-2xl px-4 py-3 shadow-sm",
                        isMine
                            ? "rounded-br-md bg-blue-600 text-white"
                            : "rounded-bl-md bg-gray-100 text-gray-900"
                    )}
                >
                    {/* Reply button */}

                    <button
                        onClick={() =>
                            onReply?.(message)
                        }
                        className={clsx(
                            "absolute top-2 hidden rounded-lg p-1 transition group-hover:flex",
                            isMine
                                ? "left-2 hover:bg-blue-500"
                                : "right-2 hover:bg-gray-200"
                        )}
                    >
                        <Reply size={14} />
                    </button>

                    {/* Images */}

                    {message.images.length >
                        0 && (
                            <div className="mb-3 grid grid-cols-2 gap-2">
                                {message.images.map(
                                    (image) => (
                                        <Image
                                            key={image}
                                            src={image}
                                            alt=""
                                            width={250}
                                            height={250}
                                            className="rounded-xl object-cover"
                                        />
                                    )
                                )}
                            </div>
                        )}

                    {/* Text */}

                    {message.text && (
                        <p className="whitespace-pre-wrap break-words pr-6 text-[15px]">
                            {message.text}
                        </p>
                    )}

                    {/* Footer */}

                    <div
                        className={clsx(
                            "mt-2 flex items-center gap-2",
                            isMine
                                ? "justify-end text-blue-100"
                                : "justify-start text-gray-500"
                        )}
                    >
                        <span className="text-[11px]">
                            {new Date(
                                message.createdAt
                            ).toLocaleTimeString(
                                "ro-RO",
                                {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }
                            )}
                        </span>

                        {isMine && (
                            <MessageStatus
                                status={
                                    seen
                                        ? "seen"
                                        : delivered
                                            ? "delivered"
                                            : "sent"
                                }
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}