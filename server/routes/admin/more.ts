// @ts-nocheck - Prisma types
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { authenticate } from "../../middleware/auth";
import { requireAdmin, logAdminAction } from "../../middleware/admin";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

interface AuthRequest extends Request {
  user?: {
    userId: string;
    permissions: string[];
  };
}

// ============================================================================
// TASK TYPES MANAGEMENT
// ============================================================================

/**
 * GET /api/admin/more/task-types
 */
router.get("/task-types", async (_req: Request, res: Response) => {
  try {
    const taskTypes = await prisma.taskType.findMany({
      orderBy: { sortOrder: "asc" },
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
 * POST /api/admin/more/task-types
 */
router.post("/task-types", async (req: Request, res: Response) => {
  try {
    const adminId = (req as AuthRequest).user?.userId;
    const { value, label, rolePreset } = req.body;

    if (!value || !label) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "value and label are required",
      });
      return;
    }

    const maxSort = await prisma.taskType.aggregate({
      _max: { sortOrder: true },
    });

    const taskType = await prisma.taskType.create({
      data: {
        value,
        label,
        rolePreset: rolePreset || null,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
      },
    });

    await logAdminAction(adminId!, "create", "taskType", taskType.id, { label });

    res.status(201).json({
      success: true,
      data: taskType,
      message: "Task type created successfully",
    });
  } catch (error) {
    console.error("Error creating task type:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to create task type",
    });
  }
});

/**
 * PUT /api/admin/more/task-types/:id
 */
router.put("/task-types/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;
    const { value, label, rolePreset, isActive, sortOrder } = req.body;

    const updateData: any = {};
    if (value !== undefined) updateData.value = value;
    if (label !== undefined) updateData.label = label;
    if (rolePreset !== undefined) updateData.rolePreset = rolePreset;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const taskType = await prisma.taskType.update({
      where: { id },
      data: updateData,
    });

    await logAdminAction(adminId!, "update", "taskType", id);

    res.json({
      success: true,
      data: taskType,
      message: "Task type updated successfully",
    });
  } catch (error) {
    console.error("Error updating task type:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update task type",
    });
  }
});

/**
 * DELETE /api/admin/more/task-types/:id
 */
router.delete("/task-types/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;

    await prisma.taskType.update({
      where: { id },
      data: { isActive: false },
    });

    await logAdminAction(adminId!, "delete", "taskType", id);

    res.json({
      success: true,
      message: "Task type deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting task type:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to delete task type",
    });
  }
});

// ============================================================================
// REASONING TEMPLATES MANAGEMENT
// ============================================================================

/**
 * GET /api/admin/more/templates/reasoning
 */
router.get("/templates/reasoning", async (_req: Request, res: Response) => {
  try {
    const templates = await prisma.reasoningTemplate.findMany({
      orderBy: { sortOrder: "asc" },
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
      message: "Failed to fetch templates",
    });
  }
});

/**
 * POST /api/admin/more/templates/reasoning
 */
router.post("/templates/reasoning", async (req: Request, res: Response) => {
  try {
    const adminId = (req as AuthRequest).user?.userId;
    const { name, steps } = req.body;

    if (!name || !steps || !Array.isArray(steps)) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "name and steps (array) are required",
      });
      return;
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

    const maxSort = await prisma.reasoningTemplate.aggregate({
      _max: { sortOrder: true },
    });

    const template = await prisma.reasoningTemplate.create({
      data: {
        slug,
        name,
        steps,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
      },
    });

    await logAdminAction(adminId!, "create", "reasoningTemplate", template.id, { name });

    res.status(201).json({
      success: true,
      data: template,
      message: "Reasoning template created successfully",
    });
  } catch (error) {
    console.error("Error creating reasoning template:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to create template",
    });
  }
});

/**
 * PUT /api/admin/more/templates/reasoning/:id
 */
router.put("/templates/reasoning/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;
    const { name, steps, isActive, sortOrder } = req.body;

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    }
    if (steps !== undefined) updateData.steps = steps;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const template = await prisma.reasoningTemplate.update({
      where: { id },
      data: updateData,
    });

    await logAdminAction(adminId!, "update", "reasoningTemplate", id);

    res.json({
      success: true,
      data: template,
      message: "Template updated successfully",
    });
  } catch (error) {
    console.error("Error updating reasoning template:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update template",
    });
  }
});

// ============================================================================
// QUICK TEMPLATES MANAGEMENT
// ============================================================================

/**
 * GET /api/admin/more/templates/quick
 */
router.get("/templates/quick", async (_req: Request, res: Response) => {
  try {
    const templates = await prisma.quickTemplate.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
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
      message: "Failed to fetch templates",
    });
  }
});

/**
 * POST /api/admin/more/templates/quick
 */
router.post("/templates/quick", async (req: Request, res: Response) => {
  try {
    const adminId = (req as AuthRequest).user?.userId;
    const { name, template, category } = req.body;

    if (!name || !template || !category) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "name, template, and category are required",
      });
      return;
    }

    const maxSort = await prisma.quickTemplate.aggregate({
      _max: { sortOrder: true },
    });

    const quickTemplate = await prisma.quickTemplate.create({
      data: {
        name,
        template,
        category,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
      },
    });

    await logAdminAction(adminId!, "create", "quickTemplate", quickTemplate.id, { name });

    res.status(201).json({
      success: true,
      data: quickTemplate,
      message: "Quick template created successfully",
    });
  } catch (error) {
    console.error("Error creating quick template:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to create template",
    });
  }
});

/**
 * PUT /api/admin/more/templates/quick/:id
 */
router.put("/templates/quick/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;
    const { name, template, category, isActive, sortOrder } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (template !== undefined) updateData.template = template;
    if (category !== undefined) updateData.category = category;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const quickTemplate = await prisma.quickTemplate.update({
      where: { id },
      data: updateData,
    });

    await logAdminAction(adminId!, "update", "quickTemplate", id);

    res.json({
      success: true,
      data: quickTemplate,
      message: "Template updated successfully",
    });
  } catch (error) {
    console.error("Error updating quick template:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update template",
    });
  }
});

// ============================================================================
// SELECT OPTIONS MANAGEMENT
// ============================================================================

/**
 * GET /api/admin/more/options
 */
router.get("/options", async (_req: Request, res: Response) => {
  try {
    const options = await prisma.selectOption.findMany({
      orderBy: [{ type: "asc" }, { sortOrder: "asc" }],
    });

    // Group by type
    const grouped = options.reduce(
      (acc: Record<string, any[]>, opt) => {
        if (!acc[opt.type]) acc[opt.type] = [];
        acc[opt.type].push(opt);
        return acc;
      },
      {}
    );

    res.json({
      success: true,
      data: options,
      grouped,
      count: options.length,
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
 * POST /api/admin/more/options
 */
router.post("/options", async (req: Request, res: Response) => {
  try {
    const adminId = (req as AuthRequest).user?.userId;
    const { type, value, label, prefix } = req.body;

    if (!type || !value || !label) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "type, value, and label are required",
      });
      return;
    }

    const validTypes = ["tone", "focus", "constraint", "interest", "perspective"];
    if (!validTypes.includes(type)) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: `type must be one of: ${validTypes.join(", ")}`,
      });
      return;
    }

    const maxSort = await prisma.selectOption.aggregate({
      _max: { sortOrder: true },
      where: { type },
    });

    const option = await prisma.selectOption.create({
      data: {
        type,
        value,
        label,
        prefix: prefix || null,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
      },
    });

    await logAdminAction(adminId!, "create", "selectOption", option.id, { type, label });

    res.status(201).json({
      success: true,
      data: option,
      message: "Option created successfully",
    });
  } catch (error) {
    console.error("Error creating option:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to create option",
    });
  }
});

/**
 * PUT /api/admin/more/options/:id
 */
router.put("/options/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;
    const { value, label, prefix, isActive, sortOrder } = req.body;

    const updateData: any = {};
    if (value !== undefined) updateData.value = value;
    if (label !== undefined) updateData.label = label;
    if (prefix !== undefined) updateData.prefix = prefix;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const option = await prisma.selectOption.update({
      where: { id },
      data: updateData,
    });

    await logAdminAction(adminId!, "update", "selectOption", id);

    res.json({
      success: true,
      data: option,
      message: "Option updated successfully",
    });
  } catch (error) {
    console.error("Error updating option:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update option",
    });
  }
});

/**
 * DELETE /api/admin/more/options/:id
 */
router.delete("/options/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;

    await prisma.selectOption.update({
      where: { id },
      data: { isActive: false },
    });

    await logAdminAction(adminId!, "delete", "selectOption", id);

    res.json({
      success: true,
      message: "Option deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting option:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to delete option",
    });
  }
});

export default router;
