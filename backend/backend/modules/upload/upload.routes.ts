import { Router } from "express";

import { uploadController } from "./upload.controller.js";
import { upload } from "../../middleware/upload.js";
import auth from "../../middleware/auth.js";

const router = Router();

router.post(
    "/",
    auth,
    upload.array("images", 10),
    uploadController.upload
);

export default router;
