"use client";

import { useQuery } from "@tanstack/react-query";

import { chatService } from "../services/chat.service";

export function useConversation(
    conversationId: string
) {
    return useQuery({
        queryKey: [
            "conversation",
            conversationId,
        ],
        queryFn: () =>
            chatService.getConversation(
                conversationId
            ),
        enabled: !!conversationId,
        staleTime: 1000 * 60 * 5,
    });
}