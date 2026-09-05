import jwt from "jsonwebtoken";
import { AuthenticatedSocket } from "../types/socket.js";

export function authenticateSocket(
    socket: AuthenticatedSocket,
    next: (err?: Error) => void
) {
    try {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Unauthorized"));
        }

        const payload = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as {
            id: string;
        };

        socket.userId = payload.id;

        next();
    } catch {
        next(new Error("Unauthorized"));
    }
}