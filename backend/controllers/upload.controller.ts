import { Request, Response } from "express";
import { uploadImage } from "../services/upload.service.js";

export async function uploadImages(req: Request, res: Response) {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        message: "Nu au fost încărcate imagini.",
      });
    }

    const folder = (req.body.folder || "listings").trim();
    const subfolder = req.body.subfolder;

    const urls = await Promise.all(
      files.map((file) => uploadImage(file, folder, subfolder))
    );

    return res.status(200).json({
      success: true,
      images: urls,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Eroare la upload.",
    });
  }
}