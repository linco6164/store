"use client";

import { Reply, X } from "lucide-react";

import { Message } from "../../types/chat";

interface ReplyPreviewProps {
    message: Message | null;
    onCancel: () => void;
}

export default function ReplyPreview({
    message,
    onCancel,
}: ReplyPreviewProps) {
    if (!message) return null;

    return (
        <div className="mb-3 flex items-start justify-between rounded-xl border-l-4 border-blue-500 bg-blue-50 p-3">

            <div className="flex items-start gap-3">

                <Reply
                    size={18}
                    className="mt-0.5 text-blue-600"
                />

                <div>

                    <p className="text-xs font-semibold text-blue-700">
                        {message.sender.username}
                    </p>

                    <p className="line-clamp-2 text-sm text-gray-700">
                        {message.text ||
                            "📷 Imagine"}
                    </p>

                </div>

            </div>

            <button
                onClick={onCancel}
                className="rounded-full p-1 transition hover:bg-gray-200"
            >
                <X size={16} />
            </button>

        </div>
    );
}