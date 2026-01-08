// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { sendSuccess, sendError, sendNotFound } from "../../utils";

const router = Router();

/**
 * @swagger
 * /api/templates/reasoning:
 *   get:
 *     summary: Get all reasoning templates
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: List of reasoning templates
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
 * @swagger
 * /api/templates/quick:
 *   get:
 *     summary: Get all quick templates
 *     tags: [Config]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of quick templates
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
 * @swagger
 * /api/templates/quick/categories:
 *   get:
 *     summary: Get all quick template categories
 *     tags: [Config]
 *     responses:
 *       200:
 *         description: List of categories
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
 * @swagger
 * /api/templates/reasoning/{slug}:
 *   get:
 *     summary: Get single reasoning template
 *     tags: [Config]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Template details
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
