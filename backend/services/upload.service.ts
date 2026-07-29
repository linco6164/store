import { PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import { randomUUID } from "crypto";
import { r2 } from "../config/r2.js";

export async function uploadImage(
  file: Express.Multer.File,
  folder: string,
  subfolder?: string
) {
  const filename = `${randomUUID()}.webp`;

  const key = subfolder
    ? `${folder}/${subfolder}/${filename}`
    : `${folder}/${filename}`;

  const buffer = await sharp(file.buffer)
    .rotate()
    .resize({
      width: 1600,
      withoutEnlargement: true,
    })
    .webp({
      quality: 82,
    })
    .toBuffer();

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: "image/webp",
    })
  );

  return `${process.env.R2_PUBLIC_URL}/${key}`;
}