import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";

import { v2 as cloudinary } from "cloudinary";

import config from "../config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads");

let cloudinaryConfigured = false;

if (config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret
  });
  cloudinaryConfigured = true;
}

function sanitizeFileName(fileName) {
  return fileName.replace(/[^a-zA-Z0-9.-]/g, "-");
}

async function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith("video/") ? "video" : "image";
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "love-timeline",
        resource_type: "auto",
        use_filename: true,
        filename_override: sanitizeFileName(file.originalname)
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Cloudinary upload failed."));
          return;
        }

        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType,
          fileName: file.originalname
        });
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
}

async function saveLocally(file) {
  await fs.mkdir(uploadsDir, { recursive: true });

  const fileName = `${Date.now()}-${sanitizeFileName(file.originalname)}`;
  const targetPath = path.join(uploadsDir, fileName);
  await fs.writeFile(targetPath, file.buffer);

  return {
    url: `/uploads/${fileName}`,
    publicId: "",
    resourceType: file.mimetype.startsWith("video/") ? "video" : "image",
    fileName: file.originalname
  };
}

export async function uploadMediaFiles(files) {
  if (!files?.length) {
    return [];
  }

  const results = [];

  for (const file of files) {
    const mediaItem = cloudinaryConfigured ? await uploadToCloudinary(file) : await saveLocally(file);
    results.push(mediaItem);
  }

  return results;
}

export async function deleteMediaFiles(mediaItems = []) {
  for (const item of mediaItems) {
    if (item.publicId && cloudinaryConfigured) {
      await cloudinary.uploader
        .destroy(item.publicId, { resource_type: item.resourceType || "image" })
        .catch(() => null);
      continue;
    }

    if (item.url?.startsWith("/uploads/")) {
      const filePath = path.resolve(uploadsDir, item.url.replace("/uploads/", ""));
      await fs.unlink(filePath).catch(() => null);
    }
  }
}

export function getUploadsDirectory() {
  return uploadsDir;
}
