import { Router } from "express";
import auth from "../../middleware/auth.js";

import { listingController } from "./listing.controller.js";

const router = Router();

router.post("/", auth, listingController.create);

router.get("/", listingController.findAll);

router.get("/search", listingController.search);

router.get("/:id", listingController.findById);

router.patch("/:id", listingController.update);

router.patch("/:id/status", listingController.updateStatus);

router.delete("/:id", listingController.delete);

export default router;