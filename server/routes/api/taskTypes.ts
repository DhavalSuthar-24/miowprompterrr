// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";

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

    res.json({
      success: true,
      data: taskTypes,
      count: taskTypes.length,
    });
  } catch (error) {
    console.error("Error fetching task types:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch task types",
    });
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
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Task type not found",
      });
      return;
    }

    res.json({
      success: true,
      data: taskType,
    });
  } catch (error) {
    console.error("Error fetching task type:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch task type",
    });
  }
});

export default router;
