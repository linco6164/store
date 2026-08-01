import { Router } from "express";

import auth from "../../middleware/auth.js";

import { profileController } from "./profile.controller.js";

const router = Router();

router.get(
    "/",
    auth,
    profileController.me
);

router.patch("/", auth, profileController.update);

export default router;
