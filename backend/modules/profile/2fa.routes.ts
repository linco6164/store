import { Router } from "express";
import auth from "../../middleware/auth.js";
import * as twoFactorController from "./2fa.controller.js";

const router = Router();

router.post(
    "/setup",
    auth,
    twoFactorController.setup
);

router.post(
    "/verify",
    auth,
    twoFactorController.verify
);

export default router;