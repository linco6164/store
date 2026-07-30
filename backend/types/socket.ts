import { Socket } from "socket.io";

export interface AuthenticatedSocket extends Socket {
    userId?: string;
}

export interface SendMessagePayload {
    conversationId: string;
    text: string;
    images?: string[];
}

export interface TypingPayload {
    conversationId: string;
}

export interface SeenPayload {
    conversationId: string;
}