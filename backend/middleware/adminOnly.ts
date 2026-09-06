import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.js"; // ← corectat: din middleware/auth.js, nu routes/auth.js
import  User  from "../models/Users.js";

export default async function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const user = await User.findById(req.userId);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Acces interzis" });
        }
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: "Eroare de autorizare" });
    }
}