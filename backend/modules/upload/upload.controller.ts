import { Request, Response } from "express";

import { uploadService } from "./upload.service.js";

class UploadController {
    async upload(req: Request, res: Response) {
        try {
            const files = req.files as Express.Multer.File[];

            if (!files?.length) {
                return res.status(400).json({
                    success: false,
                    message: "No files uploaded.",
                });
            }

            const urls =
                await uploadService.uploadFiles(files);

            return res.status(201).json({
                success: true,
                urls,
            });
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                success: false,
                message: "Upload failed.",
            });
        }
    }
}

export const uploadController =
    new UploadController();