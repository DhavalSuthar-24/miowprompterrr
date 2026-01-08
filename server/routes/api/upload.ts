import { Router, Request, Response } from "express";
import multer from "multer";
import { uploadImage } from "../../utils/upload";
import { authenticate } from "../../middleware";
import { sendSuccess, sendError } from "../../utils";

const router = Router();

// Configure multer (memory storage for processing)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload an image
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded
 */
router.post(
  "/",
  authenticate,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: "Validation error",
          message: "No image file provided",
        });
        return;
      }

      // Upload to Cloudinary
      const result = await uploadImage(req.file.buffer, "miownation_uploads");

      return sendSuccess(res, {
        url: result.url,
        publicId: result.public_id,
      }, "Image uploaded successfully");
    } catch (error) {
      return sendError(res, error, "Failed to upload image");
    }
  }
);

export default router;
