import { Router } from "express";
import supportAuth from "../../middleware/supportAuth.js";
import { supportController } from "./support.controller.js";

const router = Router();

router.use(supportAuth);

router.post("/tickets", supportController.createTicket);
router.get("/tickets", supportController.getTickets);
router.get("/tickets/:id", supportController.getTicket);
router.post(
  "/tickets/:id/messages",
  supportController.addMessage,
);
router.patch(
  "/tickets/:id/close",
  supportController.closeTicket,
);

export default router;