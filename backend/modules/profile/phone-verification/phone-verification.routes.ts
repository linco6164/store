import { Router } from "express";
import  auth from "../../../middleware/auth.js";
import {
  send,
  verify,
  requestChange,
  confirmChange,
} from "./phone-verification.controller.js";

const router = Router();

router.post("/send", auth, send);

router.post("/verify", auth, verify);

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