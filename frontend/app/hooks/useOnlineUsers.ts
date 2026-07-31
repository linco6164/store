"use client";

import { useEffect, useState } from "react";

import { socket } from "../lib/socket";

export function useOnlineUsers() {
    const [onlineUsers, setOnlineUsers] =
        useState<string[]>([]);

    useEffect(() => {
        function handleOnlineUsers(
            users: string[]
        ) {
            setOnlineUsers(users);
        }

        socket.on(
            "onlineUsers",
            handleOnlineUsers
        );

        return () => {
            socket.off(
                "onlineUsers",
                handleOnlineUsers
            );
        };
    }, []);

    return onlineUsers;
}