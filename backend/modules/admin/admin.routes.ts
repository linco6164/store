import { Router } from "express";
import auth from "../../middleware/auth.js";
import adminOnly from "../../middleware/adminOnly.js";
import { adminController } from "./admin.controller.js";

const router = Router();

router.use(auth, adminOnly); // toate rutele de mai jos cer admin

// Dashboard
router.get("/stats", adminController.getStats);

// Useri
router.get("/users", adminController.getUsers);
router.patch("/users/:id/role", adminController.updateUserRole);
router.patch("/users/:id/ban", adminController.toggleBanUser);
router.delete("/users/:id", adminController.deleteUser);

// Anunțuri
router.get("/listings", adminController.getAllListings);
router.delete("/listings/:id", adminController.deleteListing);

// Notificări
router.post("/broadcast", adminController.sendBroadcast);

export default router;