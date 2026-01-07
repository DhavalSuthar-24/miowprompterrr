// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";

const router = Router();

/**
 * GET /api/personalities
 * Get all active personalities
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

    res.json({
      success: true,
      data: personalities,
      count: personalities.length,
    });
  } catch (error) {
    console.error("Error fetching personalities:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch personalities",
    });
  }
});

/**
 * GET /api/personalities/:idOrSlug
 * Get a single personality by ID or slug
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
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Personality not found",
      });
      return;
    }

    res.json({
      success: true,
      data: personality,
    });
  } catch (error) {
    console.error("Error fetching personality:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch personality",
    });
  }
});

export default router;
