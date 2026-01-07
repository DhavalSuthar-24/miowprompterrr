import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { config } from "../config";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

/**
 * Upload an image buffer to Cloudinary using a stream
 * @param buffer - File buffer from multer
 * @param folder - Optional folder name
 * @returns Promise with upload result
 */
export const uploadImage = (
  buffer: Buffer,
  folder: string = "miownation_prompter"
): Promise<{ url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error:", error);
          return reject(error);
        }
        if (!result) {
          return reject(new Error("Upload failed: No result returned"));
        }
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};
