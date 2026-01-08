// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { sendSuccess, sendError, sendNotFound } from "../../utils";

const router = Router();

/**
 * @swagger
 * /api/personalities:
 *   get:
 *     summary: Get all personalities
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: List of personalities
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const personalities = await prisma.personality.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        icon: true,
        age: true,
        iq: true,
        traits: true,
        rules: true,
        expertise: true,
        reasoningStyle: true,
        cognitiveApproach: true,
        thinkingFramework: true,
        strengthAreas: true,
        specialAbilities: true,
        outputExample: true,
        isDefault: true,
        sortOrder: true,
      },
    });

    return sendSuccess(res, personalities);
  } catch (error) {
    return sendError(res, error, "Failed to fetch personalities");
  }
});

/**
 * @swagger
 * /api/personalities/{idOrSlug}:
 *   get:
 *     summary: Get single personality
 *     tags: [Config]
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Personality details
 */
router.get("/:idOrSlug", async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;

    // Try to find by slug first, then by ID
    let personality = await prisma.personality.findUnique({
      where: { slug: idOrSlug },
    });

    if (!personality) {
      personality = await prisma.personality.findUnique({
        where: { id: idOrSlug },
      });
    }

    if (!personality) {
      return sendNotFound(res, "Personality");
    }

    return sendSuccess(res, personality);
  } catch (error) {
    return sendError(res, error, "Failed to fetch personality");
  }
});

export default router;
