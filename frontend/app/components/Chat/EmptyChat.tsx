"use client";

import { MessageCircle } from "lucide-react";

interface EmptyChatProps {
    title?: string;
    description?: string;
}

export default function EmptyChat({
    title = "No conversation selected",
    description = "Choose a conversation from the list or start chatting from a listing.",
}: EmptyChatProps) {
    return (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="mb-6 rounded-full bg-gray-100 p-6">
                <MessageCircle
                    size={48}
                    className="text-gray-400"
                />
            </div>

            <h2 className="text-xl font-semibold">
                {title}
            </h2>

            <p className="mt-2 max-w-md text-gray-500">
                {description}
            </p>
        </div>
    );
}