"use client";

import { useQuery } from "@tanstack/react-query";

import { chatService } from "../services/chat.service";

export function useConversations() {
    return useQuery({
        queryKey: ["conversations"],
        queryFn: () =>
            chatService.getConversations(),
    });
}