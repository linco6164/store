import { Router } from "express";
import auth from "../../middleware/auth.js";
import adminOnly from "../../middleware/adminOnly.js";
import staffAccess from "../../middleware/staffAccess.js";
import { adminController } from "./admin.controller.js";
import financeAccess from "../../middleware/financeAccess.js";

const router = Router();

/*
|--------------------------------------------------------------------------
| ADMIN ONLY
|--------------------------------------------------------------------------
*/

router.get(
  "/stats",
  auth,
  staffAccess,
  adminController.getStats,
);

router.get(
  "/users",
  auth,
  adminOnly,
  adminController.getUsers,
);

router.post(
  "/users",
  auth,
  adminOnly,
  adminController.createUser,
);

router.patch(
  "/users/:id/role",
  auth,
  adminOnly,
  adminController.updateUserRole,
);

router.patch(
  "/users/:id/ban",
  auth,
  adminOnly,
  adminController.toggleBanUser,
);

router.delete(
  "/users/:id",
  auth,
  adminOnly,
  adminController.deleteUser,
);

router.get(
  "/users/:id",
  auth,
  adminOnly,
  adminController.getUserDetails,
);

router.patch(
  "/users/:id/password",
  auth,
  adminOnly,
  adminController.resetUserPassword,
);

router.patch(
  "/users/:id/email",
  auth,
  adminOnly,
  adminController.updateUserEmail,
);

router.patch(
  "/users/:id/2fa/disable",
  auth,
  adminOnly,
  adminController.disableUserTwoFactor,
);

router.patch(
  "/users/:id/profile",
  auth,
  adminOnly,
  adminController.updateUserProfile,
);


/*
|--------------------------------------------------------------------------
| LISTINGS
|--------------------------------------------------------------------------
*/

router.get(
  "/listings",
  auth,
  adminOnly,
  adminController.getAllListings,
);

router.delete(
  "/listings/:id",
  auth,
  adminOnly,
  adminController.deleteListing,
);


/*
|--------------------------------------------------------------------------
| WITHDRAWALS
|--------------------------------------------------------------------------
*/

router.get(
  "/withdrawals",
  auth,
  financeAccess,
  adminController.getWithdrawals,
);

router.post(
  "/withdrawals/:id/approve",
  auth,
  financeAccess,
  adminController.approveWithdrawal,
);

router.post(
  "/withdrawals/:id/reject",
  auth,
  financeAccess,
  adminController.rejectWithdrawal,
);


/*
|--------------------------------------------------------------------------
| BROADCAST
|--------------------------------------------------------------------------
*/

router.post(
  "/broadcast",
  auth,
  adminOnly,
  adminController.sendBroadcast,
);

export default router;