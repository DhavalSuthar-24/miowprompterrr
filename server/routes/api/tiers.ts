// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { sendSuccess, sendError, sendNotFound } from "../../utils";

const router = Router();

/**
 * @swagger
 * /api/tiers:
 *   get:
 *     summary: Get all tiers
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: List of tiers
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const tiers = await prisma.tier.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        techniques: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            slug: true,
            label: true,
            description: true,
            sortOrder: true,
          },
        },
      },
    });

    return sendSuccess(res, tiers);
  } catch (error) {
    return sendError(res, error, "Failed to fetch tiers");
  }
});

/**
 * @swagger
 * /api/tiers/techniques/all:
 *   get:
 *     summary: Get all techniques
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: List of techniques
 */
router.get("/techniques/all", async (_req: Request, res: Response) => {
  try {
    const techniques = await prisma.technique.findMany({
      where: { isActive: true },
      orderBy: [{ tier: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: {
        tier: {
          select: {
            id: true,
            slug: true,
            label: true,
            color: true,
          },
        },
      },
    });

    // Group by tier
    const grouped = techniques.reduce(
      (acc, technique) => {
        const tierSlug = technique.tier.slug;
        if (!acc[tierSlug]) {
          acc[tierSlug] = {
            tier: technique.tier,
            techniques: [],
          };
        }
        acc[tierSlug].techniques.push({
          id: technique.id,
          slug: technique.slug,
          label: technique.label,
          description: technique.description,
        });
        return acc;
      },
      {} as Record<string, { tier: typeof techniques[0]["tier"]; techniques: Array<{ id: string; slug: string; label: string; description: string }> }>
    );

    return sendSuccess(res, grouped);
  } catch (error) {
    return sendError(res, error, "Failed to fetch techniques");
  }
});

/**
 * @swagger
 * /api/tiers/{idOrSlug}:
 *   get:
 *     summary: Get single tier
 *     tags: [Config]
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tier details
 */
router.get("/:idOrSlug", async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;

    let tier = await prisma.tier.findUnique({
      where: { slug: idOrSlug },
      include: {
        techniques: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!tier) {
      tier = await prisma.tier.findUnique({
        where: { id: idOrSlug },
        include: {
          techniques: {
            where: { isActive: true },
            orderBy: { sortOrder: "asc" },
          },
        },
      });
    }

    if (!tier) {
      return sendNotFound(res, "Tier");
    }

    return sendSuccess(res, tier);
  } catch (error) {
    return sendError(res, error, "Failed to fetch tier");
  }
});

export default router;
