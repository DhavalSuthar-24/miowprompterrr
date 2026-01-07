// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";

const router = Router();

/**
 * GET /api/config
 * Get all configuration data in a single request (for initial app load)
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    // Fetch all configuration data in parallel
    const [
      personalities,
      presets,
      tiers,
      taskTypes,
      reasoningTemplates,
      quickTemplates,
      options,
    ] = await Promise.all([
      prisma.personality.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          icon: true,
          isDefault: true,
        },
      }),
      prisma.presetMode.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          config: true,
          isDefault: true,
        },
      }),
      prisma.tier.findMany({
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
            },
          },
        },
      }),
      prisma.taskType.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          value: true,
          label: true,
          rolePreset: true,
        },
      }),
      prisma.reasoningTemplate.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          slug: true,
          name: true,
          steps: true,
        },
      }),
      prisma.quickTemplate.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          name: true,
          template: true,
          category: true,
        },
      }),
      prisma.selectOption.findMany({
        where: { isActive: true },
        orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
        select: {
          type: true,
          value: true,
          label: true,
          prefix: true,
        },
      }),
    ]);

    // Group options by type
    const optionsGrouped = options.reduce(
      (acc, option) => {
        if (!acc[option.type]) {
          acc[option.type] = [];
        }
        acc[option.type].push({
          value: option.value,
          label: option.label,
          prefix: option.prefix,
        });
        return acc;
      },
      {} as Record<string, Array<{ value: string; label: string; prefix: string | null }>>
    );

    // Group quick templates by category
    const quickTemplatesGrouped = quickTemplates.reduce(
      (acc, template) => {
        if (!acc[template.category]) {
          acc[template.category] = [];
        }
        acc[template.category].push({
          id: template.id,
          name: template.name,
          template: template.template,
        });
        return acc;
      },
      {} as Record<string, Array<{ id: string; name: string; template: string }>>
    );

    res.json({
      success: true,
      data: {
        personalities,
        presets,
        tiers,
        taskTypes,
        reasoningTemplates,
        quickTemplates: quickTemplatesGrouped,
        options: optionsGrouped,
      },
      meta: {
        counts: {
          personalities: personalities.length,
          presets: presets.length,
          tiers: tiers.length,
          taskTypes: taskTypes.length,
          reasoningTemplates: reasoningTemplates.length,
          quickTemplates: quickTemplates.length,
        },
        fetchedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching config:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch configuration",
    });
  }
});

export default router;
