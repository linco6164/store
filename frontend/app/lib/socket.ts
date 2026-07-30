import { io, Socket } from "socket.io-client";

const SOCKET_URL =
    process.env.NEXT_PUBLIC_API_URL!.replace("/api", "");

export const socket: Socket = io(SOCKET_URL, {
    autoConnect: false,
    transports: ["websocket"],
});

export function connectSocket(token: string) {
    if (socket.connected) return;

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