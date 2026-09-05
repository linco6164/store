import { Server } from "socket.io";

let io: Server | null = null;

export function setSocketIO(
    server: Server
) {
    io = server;
}

export function getSocketIO(): Server {
    if (!io) {
        throw new Error(
            "Socket.IO server is not initialized."
        );
    }

    return io;
}