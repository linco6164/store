import { Router } from "express";
import auth from "../../middleware/auth.js";

import {
  getSessions,
  removeSession,
  removeOtherSessions,
  logout,
} from "./session.controller.js";

const router = Router();

router.get("/", auth, getSessions);

router.post("/logout", auth, logout);

router.delete("/others", auth, removeOtherSessions);

router.delete("/:sessionId", auth, removeSession);

export default router;
