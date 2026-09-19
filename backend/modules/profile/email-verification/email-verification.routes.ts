import { Router } from "express";
import auth from "../../../middleware/auth.js";

import {
  sendVerification,
  verify,
  requestChange,
  confirmChange,
} from "./email-verification.controller.js";

const router = Router();

router.post(
  "/send",
  auth,
  sendVerification,
);

router.post(
  "/verify",
  auth,
  verify,
);

router.post(
  "/change/request",
  auth,
  requestChange,
);

router.post(
  "/change/confirm",
  auth,
  confirmChange,
);

export default router;