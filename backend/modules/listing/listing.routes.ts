import { Router } from "express";
import auth from "../../middleware/auth.js";
import { upload } from "../../middleware/upload.js";

import { listingController } from "./listing.controller.js";

const router = Router();

router.post("/", auth, listingController.create);

router.get("/", listingController.findAll);

router.get("/search", listingController.search);

router.post(
  "/visual-search",
  upload.single("image"),
  listingController.visualSearch,
);

router.get("/categories", listingController.getCategories);

router.get("/categories/:categoryId", listingController.getCategory);

router.get("/:id", listingController.findById);

router.get("/mine", auth, listingController.getMyListings);

router.patch("/:id", listingController.update);

router.patch("/:id/status", listingController.updateStatus);

router.delete("/:id", listingController.delete);

export default router;
