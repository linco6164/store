import { Router } from "express";
import  auth  from "../../middleware/auth.js";
import { getCheckout } from "./checkout.controller.js";

const router = Router();

router.get("/", auth, getCheckout);

export default router;