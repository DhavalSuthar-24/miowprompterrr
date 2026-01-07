// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";

const router = Router();

// Valid option types
const validTypes = ["tone", "focus", "constraint", "interest", "perspective"] as const;
type OptionType = (typeof validTypes)[number];

/**
 * GET /api/options
 * Get all options grouped by type
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const options = await prisma.selectOption.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
      select: {
        id: true,
        type: true,
        value: true,
        label: true,
        prefix: true,
        sortOrder: true,
      },
    });

    // Group by type
    const grouped = options.reduce(
      (acc, option) => {
        if (!acc[option.type]) {
          acc[option.type] = [];
        }
        acc[option.type].push({
          id: option.id,
          value: option.value,
          label: option.label,
          prefix: option.prefix,
        });
        return acc;
      },
      {} as Record<string, Array<{ id: string; value: string; label: string; prefix: string | null }>>
    );

    res.json({
      success: true,
      data: grouped,
      types: Object.keys(grouped),
    });
  } catch (error) {
    console.error("Error fetching options:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch options",
    });
  }
});

/**
 * GET /api/options/:type
 * Get options by type (tone, focus, constraint, interest, perspective)
 */
router.get("/:type", async (req: Request, res: Response) => {
  try {
    const { type } = req.params;

    if (!validTypes.includes(type as OptionType)) {
      res.status(400).json({
        success: false,
        error: "Invalid type",
        message: `Type must be one of: ${validTypes.join(", ")}`,
      });
      return;
    }

    const options = await prisma.selectOption.findMany({
      where: {
        type,
        isActive: true,
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        value: true,
        label: true,
        prefix: true,
        sortOrder: true,
      },
    });

    res.json({
      success: true,
      data: options,
      count: options.length,
      type,
    });
  } catch (error) {
    console.error("Error fetching options by type:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch options",
    });
  }
});

export default router;
