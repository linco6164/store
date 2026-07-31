import { io, Socket } from "socket.io-client";

const SOCKET_URL =
    process.env.NEXT_PUBLIC_API_URL!.replace("/api", "");

export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
});

socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", (reason) => {
    console.log("❌ Socket disconnected:", reason);
});

socket.on("connect_error", (err) => {
    console.error("❌ Socket error:", err.message);
});

export function connectSocket(token: string) {
    if (socket.connected) {
        socket.disconnect();
    }

    socket.auth = {
        token,
    };

    socket.connect();
}

export function disconnectSocket() {
    if (socket.connected) {
        socket.disconnect();
    }
}