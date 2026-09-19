import { Router } from "express";
import auth from "../../../middleware/auth.js";

import {
  sendVerification,
  verify,
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

export default router;