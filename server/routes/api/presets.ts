// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";

const router = Router();

/**
 * GET /api/presets
 * Get all active preset modes
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

    res.json({
      success: true,
      data: presets,
      count: presets.length,
    });
  } catch (error) {
    console.error("Error fetching presets:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch preset modes",
    });
  }
});

/**
 * GET /api/presets/:idOrSlug
 * Get a single preset by ID or slug
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
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Preset mode not found",
      });
      return;
    }

    res.json({
      success: true,
      data: preset,
    });
  } catch (error) {
    console.error("Error fetching preset:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch preset mode",
    });
  }
});

export default router;
