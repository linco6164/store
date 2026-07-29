import {
    PutObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import crypto from "crypto";
import path from "path";

import { r2 } from "../../config/r2.js";

console.log({
    bucket: process.env.R2_BUCKET_NAME,
    publicUrl: process.env.R2_PUBLIC_URL,
});

const bucket = process.env.R2_BUCKET_NAME!;
const publicUrl = process.env.R2_PUBLIC_URL!;

class UploadService {
    async uploadFiles(files: Express.Multer.File[]) {
        const urls: string[] = [];

        for (const file of files) {
            const extension = path.extname(file.originalname);

            const fileName = `${crypto.randomUUID()}${extension}`;

            const key = `listings/${fileName}`;

            await r2.send(
                new PutObjectCommand({
                    Bucket: bucket,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                })
            );

            urls.push(`${publicUrl}/${key}`);
        }

        return urls;
    }

    async deleteFile(url: string) {
        const key = url.replace(`${publicUrl}/`, "");

        await r2.send(
            new DeleteObjectCommand({
                Bucket: bucket,
                Key: key,
            })
        );
    }
}

export const uploadService = new UploadService();