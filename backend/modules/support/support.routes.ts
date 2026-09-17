import { Router } from "express";

import auth from "../../middleware/auth.js";
import supportAuth from "../../middleware/supportAuth.js";
import supportRole from "../../middleware/supportRole.js";

import {
  createTicket,
  getUserTickets,
  getUserTicket,
  addUserMessage,
  getStaffTickets,
  getStaffTicket,
  getStaffStats,
  assignToMe,
  unassignTicket,
  updateStatus,
  updatePriority,
  addStaffMessage,
  getStaffInfo,
} from "./support.controller.js";

const router = Router();

/*
 * =========================================================
 * USER SUPPORT
 * =========================================================
 *
 * supportAuth este folosit pentru utilizatorii normali,
 * inclusiv conturile blocate.
 */

router.post("/tickets", supportAuth, createTicket);

router.get("/tickets", supportAuth, getUserTickets);

router.get("/tickets/:id", supportAuth, getUserTicket);

router.post("/tickets/:id/messages", supportAuth, addUserMessage);

/*
 * =========================================================
 * STAFF SUPPORT
 * =========================================================
 *
 * auth:
 *   verifică JWT + existența utilizatorului.
 *
 * supportRole:
 *   verifică dacă utilizatorul este staff.
 *
 * Departamentul este verificat ulterior
 * în support.service.ts.
 */

router.get("/staff/tickets", auth, supportRole(), getStaffTickets);

router.get("/staff/tickets/:id", auth, supportRole(), getStaffTicket);

router.get("/staff/stats", auth, supportRole(), getStaffStats);

router.post("/staff/tickets/:id/assign", auth, supportRole(), assignToMe);

router.post("/staff/tickets/:id/unassign", auth, supportRole(), unassignTicket);

router.patch("/staff/tickets/:id/status", auth, supportRole(), updateStatus);

router.patch(
  "/staff/tickets/:id/priority",
  auth,
  supportRole(),
  updatePriority,
);

router.post(
  "/staff/tickets/:id/messages",
  auth,
  supportRole(),
  addStaffMessage,
);

router.get("/staff/info", auth, supportRole(), getStaffInfo);

export default router;
