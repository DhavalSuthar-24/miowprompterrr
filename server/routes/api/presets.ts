// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { sendSuccess, sendError, sendNotFound } from "../../utils";

const router = Router();

/**
 * @swagger
 * /api/presets:
 *   get:
 *     summary: Get all preset modes
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: List of presets
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const presets = await prisma.presetMode.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        config: true,
        isDefault: true,
        sortOrder: true,
      },
    });

    return sendSuccess(res, presets);
  } catch (error) {
    return sendError(res, error, "Failed to fetch preset modes");
  }
});

/**
 * @swagger
 * /api/presets/{idOrSlug}:
 *   get:
 *     summary: Get single preset
 *     tags: [Config]
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Preset details
 */
router.get("/:idOrSlug", async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;

    let preset = await prisma.presetMode.findUnique({
      where: { slug: idOrSlug },
    });

    if (!preset) {
      preset = await prisma.presetMode.findUnique({
        where: { id: idOrSlug },
      });
    }

    if (!preset) {
      return sendNotFound(res, "Preset mode");
    }

    return sendSuccess(res, preset);
  } catch (error) {
    return sendError(res, error, "Failed to fetch preset mode");
  }
});

export default router;
