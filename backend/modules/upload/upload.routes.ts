import { Router } from "express";

import { uploadController } from "./upload.controller.js";
import { upload } from "../../middleware/upload.js";

const router = Router();

router.post(
    "/",
    upload.array("images", 10),
    uploadController.upload
);

export default router;