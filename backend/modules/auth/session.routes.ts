import { Router } from "express";
import auth from "../../middleware/auth.js";

import {
  getSessions,
  removeSession,
  removeOtherSessions,
} from "./session.controller.js";

const router = Router();

router.get("/", auth, getSessions);

router.delete("/others", auth, removeOtherSessions);

router.delete("/:sessionId", auth, removeSession);

export default router;