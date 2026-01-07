// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";

const router = Router();

/**
 * GET /api/templates/reasoning
 * Get all active reasoning templates
 */
router.get("/reasoning", async (_req: Request, res: Response) => {
  try {
    const templates = await prisma.reasoningTemplate.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        steps: true,
        sortOrder: true,
      },
    });

    res.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error) {
    console.error("Error fetching reasoning templates:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch reasoning templates",
    });
  }
});

/**
 * GET /api/templates/quick
 * Get all active quick templates
 */
router.get("/quick", async (req: Request, res: Response) => {
  try {
    const { category } = req.query;

    const templates = await prisma.quickTemplate.findMany({
      where: {
        isActive: true,
        ...(category && { category: category as string }),
      },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        template: true,
        category: true,
        sortOrder: true,
      },
    });

    res.json({
      success: true,
      data: templates,
      count: templates.length,
    });
  } catch (error) {
    console.error("Error fetching quick templates:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch quick templates",
    });
  }
});

/**
 * GET /api/templates/quick/categories
 * Get all quick template categories
 */
router.get("/quick/categories", async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.quickTemplate.findMany({
      where: { isActive: true },
      select: { category: true },
      distinct: ["category"],
    });

    res.json({
      success: true,
      data: categories.map((c) => c.category),
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch categories",
    });
  }
});

/**
 * GET /api/templates/reasoning/:slug
 * Get a single reasoning template by slug
 */
router.get("/reasoning/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const template = await prisma.reasoningTemplate.findUnique({
      where: { slug },
    });

    if (!template) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Reasoning template not found",
      });
      return;
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error("Error fetching reasoning template:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch reasoning template",
    });
  }
});

export default router;
