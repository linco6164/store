import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 20,
  },

  fileFilter(req, file, cb) {
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];

    const allowedExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".heic",
      ".heif",
    ];

    const mimetype = file.mimetype.toLowerCase();
    const originalName = file.originalname.toLowerCase();

    const extension = originalName.includes(".")
      ? originalName.substring(
          originalName.lastIndexOf(".")
        )
      : "";

    const isValidMime =
      mimetype.startsWith("image/") ||
      allowedMimeTypes.includes(mimetype);

    const isValidExtension =
      allowedExtensions.includes(extension);

    if (!isValidMime && !isValidExtension) {
      return cb(
        new Error("Doar imaginile sunt permise.")
      );
    }

    cb(null, true);
  },
});