// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { sendSuccess, sendError, sendNotFound } from "../../utils";

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

    return sendSuccess(res, templates);
  } catch (error) {
    return sendError(res, error, "Failed to fetch reasoning templates");
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

    return sendSuccess(res, templates);
  } catch (error) {
    return sendError(res, error, "Failed to fetch quick templates");
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

    return sendSuccess(res, categories.map((c) => c.category));
  } catch (error) {
    return sendError(res, error, "Failed to fetch categories");
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
      return sendNotFound(res, "Reasoning template");
    }

    return sendSuccess(res, template);
  } catch (error) {
    return sendError(res, error, "Failed to fetch reasoning template");
  }
});

export default router;
