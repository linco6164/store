import { Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface JwtPayload {
    id: string;
}

export function authenticateSocket(socket: Socket): string | null {
    try {
        const token = socket.handshake.auth?.token;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as JwtPayload;

        return decoded.id;
    } catch {
        return null;
    }
}