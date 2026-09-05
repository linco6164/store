"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { chatService } from "../../services/chat.service";

interface Props {
    listingId: string;
}

export default function ContactSellerButton({
    listingId,
}: Props) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    async function handleClick() {
        try {
            setLoading(true);

            const conversation =
                await chatService.startConversation(
                    listingId
                );

            router.push(
                `/messages/${conversation._id}`
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleClick}
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-3 text-white transition hover:bg-gray-800 disabled:opacity-50"
        >
            {loading
                ? "Se deschide..."
                : "Contactează vânzătorul"}
        </button>
    );
}