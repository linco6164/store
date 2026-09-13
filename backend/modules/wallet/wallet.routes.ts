import { Router } from "express";

import auth from "../../middleware/auth.js";

import {
  walletController,
} from "./wallet.controller.js";

const router = Router();

router.get(
  "/",
  auth,
  walletController.getWallet,
);

router.get(
  "/transactions",
  auth,
  walletController.getTransactions,
);

router.post(
  "/purchase",
  auth,
  walletController.purchase,
);

router.post(
  "/withdraw",
  auth,
  walletController.withdraw,
);

export default router;