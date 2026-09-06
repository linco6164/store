import { Router } from "express";
import auth from "../middleware/auth.js";
import adminOnly from "../middleware/adminOnly.js";
import { notificationService } from "../modules/notification/notification.service.js";

const router = Router();

router.post("/", auth, adminOnly, async (req, res) => {
    try {
        const { title, body, data } = req.body;

        if (!title || !body) {
            return res.status(400).json({ success: false, message: "Titlu și mesaj sunt obligatorii" });
        }

        await notificationService.sendBroadcastNotification({ title, body, data });
        res.json({ success: true, message: "Notificare trimisă către toți userii" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Eroare la trimiterea notificării" });
    }
});

export default router;