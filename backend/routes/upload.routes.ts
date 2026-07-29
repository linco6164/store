import { Router } from "express";
import { upload } from "../middleware/upload.js";
import { uploadImages } from "../controllers/upload.controller.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post(
  "/",
  auth,
  upload.array("images", 20),
  uploadImages
);

export default router;