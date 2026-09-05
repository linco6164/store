"use client";

import { useEffect } from "react";

import {
    connectSocket,
    disconnectSocket,
    socket,
} from "../lib/socket";

interface UseSocketOptions {
    token?: string;
}

export function useSocket({
    token,
}: UseSocketOptions) {
    useEffect(() => {
        if (!token) return;

        connectSocket(token);

        return () => {
            disconnectSocket();
        };
    }, [token]);

    return socket;
}