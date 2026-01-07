// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { sendSuccess, sendError, sendNotFound } from "../../utils";

const router = Router();

/**
 * GET /api/task-types
 * Get all active task types
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const taskTypes = await prisma.taskType.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        value: true,
        label: true,
        rolePreset: true,
        sortOrder: true,
      },
    });

    return sendSuccess(res, taskTypes);
  } catch (error) {
    return sendError(res, error, "Failed to fetch task types");
  }
});

/**
 * GET /api/task-types/:value
 * Get a single task type by value
 */
router.get("/:value", async (req: Request, res: Response) => {
  try {
    const { value } = req.params;

    const taskType = await prisma.taskType.findUnique({
      where: { value },
    });

    if (!taskType) {
      return sendNotFound(res, "Task type");
    }

    return sendSuccess(res, taskType);
  } catch (error) {
    return sendError(res, error, "Failed to fetch task type");
  }
});

export default router;
