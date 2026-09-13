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

router.get("/users/:id", adminController.getUserDetails);
router.patch("/users/:id/password", adminController.resetUserPassword);
router.patch("/users/:id/email", adminController.updateUserEmail);
router.patch("/users/:id/2fa/disable", adminController.disableUserTwoFactor);
router.patch("/users/:id/profile", adminController.updateUserProfile);

// Anunțuri
router.get("/listings", adminController.getAllListings);
router.delete("/listings/:id", adminController.deleteListing);

// Retrageri
router.get(
  "/withdrawals",
  adminController.getWithdrawals,
);

router.post(
  "/withdrawals/:id/approve",
  adminController.approveWithdrawal,
);

router.post(
  "/withdrawals/:id/reject",
  adminController.rejectWithdrawal,
);

// Notificări
router.post("/broadcast", adminController.sendBroadcast);

export default router;