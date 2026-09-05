import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: string;
}

export default function auth(
    req: AuthRequest,
    res: Response,
    next: NextFunction
) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }

        const token = authHeader.replace("Bearer ", "");

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET!
        ) as {
            id: string;
        };

        req.userId = decoded.id;

        next();
    } catch {
        return res.status(401).json({
            message: "Invalid token",
        });
    }
}