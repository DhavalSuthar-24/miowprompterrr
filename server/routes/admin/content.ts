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
// PERSONALITIES MANAGEMENT
// ============================================================================

/**
 * @swagger
 * /api/admin/content/personalities:
 *   get:
 *     summary: List all personalities
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: List of personalities
 */
router.get("/personalities", async (req: Request, res: Response) => {
  try {
    const { includeInactive = true } = req.query;

    const where = includeInactive === "false" ? { isActive: true } : {};

    const personalities = await prisma.personality.findMany({
      where,
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        icon: true,
        isActive: true,
        isDefault: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { prompts: true } },
      },
    });

    res.json({
      success: true,
      data: personalities.map((p) => ({
        ...p,
        promptCount: p._count.prompts,
      })),
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
 * @swagger
 * /api/admin/content/personalities:
 *   post:
 *     summary: Create new personality
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               icon:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Personality created
 */
router.post("/personalities", async (req: Request, res: Response) => {
  try {
    const adminId = (req as AuthRequest).user?.userId;
    const {
      name,
      description,
      icon,
      age,
      iq,
      traits,
      rules,
      expertise,
      reasoningStyle,
      cognitiveApproach,
      thinkingFramework,
      strengthAreas,
      specialAbilities,
      outputExample,
      isDefault,
    } = req.body;

    // Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Name must be at least 2 characters",
      });
      return;
    }

    if (!description || typeof description !== "string") {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Description is required",
      });
      return;
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check slug uniqueness
    const existing = await prisma.personality.findUnique({ where: { slug } });
    if (existing) {
      res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A personality with this name already exists",
      });
      return;
    }

    // Get max sort order
    const maxSort = await prisma.personality.aggregate({
      _max: { sortOrder: true },
    });

    const personality = await prisma.personality.create({
      data: {
        slug,
        name: name.trim(),
        description: description.trim(),
        icon: icon || "🤖",
        age: age || null,
        iq: iq || null,
        traits: traits || null,
        rules: rules || null,
        expertise: expertise || null,
        reasoningStyle: reasoningStyle || null,
        cognitiveApproach: cognitiveApproach || null,
        thinkingFramework: thinkingFramework || null,
        strengthAreas: strengthAreas || [],
        specialAbilities: specialAbilities || [],
        outputExample: outputExample || null,
        isDefault: isDefault || false,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
        createdById: adminId,
      },
    });

    await logAdminAction(adminId!, "create", "personality", personality.id, {
      name: personality.name,
    });

    res.status(201).json({
      success: true,
      data: personality,
      message: "Personality created successfully",
    });
  } catch (error) {
    console.error("Error creating personality:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to create personality",
    });
  }
});

/**
 * @swagger
 * /api/admin/content/personalities/{id}:
 *   put:
 *     summary: Update personality
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Personality updated
 */
router.put("/personalities/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;
    const updates = req.body;

    // Check exists
    const existing = await prisma.personality.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Personality not found",
      });
      return;
    }

    // Filter allowed fields
    const allowedFields = [
      "name",
      "description",
      "icon",
      "age",
      "iq",
      "traits",
      "rules",
      "expertise",
      "reasoningStyle",
      "cognitiveApproach",
      "thinkingFramework",
      "strengthAreas",
      "specialAbilities",
      "outputExample",
      "isActive",
      "isDefault",
      "sortOrder",
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    // Update slug if name changed
    if (updateData.name && updateData.name !== existing.name) {
      updateData.slug = updateData.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    const personality = await prisma.personality.update({
      where: { id },
      data: updateData,
    });

    await logAdminAction(adminId!, "update", "personality", id, {
      fields: Object.keys(updateData),
    });

    res.json({
      success: true,
      data: personality,
      message: "Personality updated successfully",
    });
  } catch (error) {
    console.error("Error updating personality:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update personality",
    });
  }
});

/**
 * @swagger
 * /api/admin/content/personalities/{id}:
 *   delete:
 *     summary: Deactivate personality
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Personality deactivated
 */
router.delete("/personalities/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;

    const existing = await prisma.personality.findUnique({
      where: { id },
      select: { id: true, name: true, _count: { select: { prompts: true } } },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Personality not found",
      });
      return;
    }

    await prisma.personality.update({
      where: { id },
      data: { isActive: false },
    });

    await logAdminAction(adminId!, "delete", "personality", id, {
      name: existing.name,
      associatedPrompts: existing._count.prompts,
    });

    res.json({
      success: true,
      message: "Personality deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting personality:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to delete personality",
    });
  }
});

/**
 * @swagger
 * /api/admin/content/personalities/reorder:
 *   put:
 *     summary: Reorder personalities
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     sortOrder:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Personalities reordered
 */
router.put("/personalities/reorder", async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // Array of { id, sortOrder }
    const adminId = (req as AuthRequest).user?.userId;

    if (!Array.isArray(items)) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "items array required",
      });
      return;
    }

    // Update each in a transaction
    await prisma.$transaction(
      items.map((item: { id: string; sortOrder: number }) =>
        prisma.personality.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    await logAdminAction(adminId!, "reorder", "personality", null, {
      count: items.length,
    });

    res.json({
      success: true,
      message: "Personalities reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering personalities:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to reorder personalities",
    });
  }
});

// ============================================================================
// PRESETS MANAGEMENT
// ============================================================================

/**
 * @swagger
 * /api/admin/content/presets:
 *   get:
 *     summary: List all presets
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of presets
 */
router.get("/presets", async (_req: Request, res: Response) => {
  try {
    const presets = await prisma.presetMode.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        config: true,
        isActive: true,
        isDefault: true,
        sortOrder: true,
        createdAt: true,
        _count: { select: { prompts: true } },
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
      message: "Failed to fetch presets",
    });
  }
});

/**
 * @swagger
 * /api/admin/content/presets:
 *   post:
 *     summary: Create new preset
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, config]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               config:
 *                 type: object
 *     responses:
 *       201:
 *         description: Preset created
 */
router.post("/presets", async (req: Request, res: Response) => {
  try {
    const adminId = (req as AuthRequest).user?.userId;
    const { name, description, config, isDefault } = req.body;

    if (!name || !description || !config) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "name, description, and config are required",
      });
      return;
    }

    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const maxSort = await prisma.presetMode.aggregate({
      _max: { sortOrder: true },
    });

    const preset = await prisma.presetMode.create({
      data: {
        slug,
        name: name.trim(),
        description: description.trim(),
        config,
        isDefault: isDefault || false,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
      },
    });

    await logAdminAction(adminId!, "create", "preset", preset.id, { name });

    res.status(201).json({
      success: true,
      data: preset,
      message: "Preset created successfully",
    });
  } catch (error) {
    console.error("Error creating preset:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to create preset",
    });
  }
});

/**
 * @swagger
 * /api/admin/content/presets/{id}:
 *   put:
 *     summary: Update preset
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               config:
 *                 type: object
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Preset updated
 */
router.put("/presets/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;
    const { name, description, config, isActive, isDefault, sortOrder } = req.body;

    const existing = await prisma.presetMode.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Preset not found",
      });
      return;
    }

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }
    if (description !== undefined) updateData.description = description;
    if (config !== undefined) updateData.config = config;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const preset = await prisma.presetMode.update({
      where: { id },
      data: updateData,
    });

    await logAdminAction(adminId!, "update", "preset", id, { fields: Object.keys(updateData) });

    res.json({
      success: true,
      data: preset,
      message: "Preset updated successfully",
    });
  } catch (error) {
    console.error("Error updating preset:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update preset",
    });
  }
});

/**
 * @swagger
 * /api/admin/content/presets/{id}:
 *   delete:
 *     summary: Deactivate preset
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Preset deactivated
 */
router.delete("/presets/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;

    await prisma.presetMode.update({
      where: { id },
      data: { isActive: false },
    });

    await logAdminAction(adminId!, "delete", "preset", id);

    res.json({
      success: true,
      message: "Preset deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting preset:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to delete preset",
    });
  }
});

// ============================================================================
// TIERS & TECHNIQUES MANAGEMENT
// ============================================================================

/**
 * @swagger
 * /api/admin/content/tiers:
 *   get:
 *     summary: List all tiers
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tiers
 */
router.get("/tiers", async (_req: Request, res: Response) => {
  try {
    const tiers = await prisma.tier.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        techniques: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    res.json({
      success: true,
      data: tiers,
      count: tiers.length,
    });
  } catch (error) {
    console.error("Error fetching tiers:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch tiers",
    });
  }
});

/**
 * @swagger
 * /api/admin/content/tiers:
 *   post:
 *     summary: Create new tier
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [label, color, description]
 *             properties:
 *               label:
 *                 type: string
 *               color:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tier created
 */
router.post("/tiers", async (req: Request, res: Response) => {
  try {
    const adminId = (req as AuthRequest).user?.userId;
    const { label, color, description } = req.body;

    if (!label || !color || !description) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "label, color, and description are required",
      });
      return;
    }

    const slug = label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

    const maxSort = await prisma.tier.aggregate({ _max: { sortOrder: true } });

    const tier = await prisma.tier.create({
      data: {
        slug,
        label,
        color,
        description,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
      },
    });

    await logAdminAction(adminId!, "create", "tier", tier.id, { label });

    res.status(201).json({
      success: true,
      data: tier,
      message: "Tier created successfully",
    });
  } catch (error) {
    console.error("Error creating tier:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to create tier",
    });
  }
});

/**
 * @swagger
 * /api/admin/content/tiers/{id}:
 *   put:
 *     summary: Update tier
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               color:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tier updated
 */
router.put("/tiers/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;
    const { label, color, description, isActive, sortOrder } = req.body;

    const updateData: any = {};
    if (label !== undefined) {
      updateData.label = label;
      updateData.slug = label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    }
    if (color !== undefined) updateData.color = color;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const tier = await prisma.tier.update({
      where: { id },
      data: updateData,
    });

    await logAdminAction(adminId!, "update", "tier", id, { fields: Object.keys(updateData) });

    res.json({
      success: true,
      data: tier,
      message: "Tier updated successfully",
    });
  } catch (error) {
    console.error("Error updating tier:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update tier",
    });
  }
});

/**
 * @swagger
 * /api/admin/content/techniques:
 *   post:
 *     summary: Create new technique
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tierId, label, description]
 *             properties:
 *               tierId:
 *                 type: string
 *               label:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Technique created
 */
router.post("/techniques", async (req: Request, res: Response) => {
  try {
    const adminId = (req as AuthRequest).user?.userId;
    const { tierId, label, description } = req.body;

    if (!tierId || !label || !description) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "tierId, label, and description are required",
      });
      return;
    }

    const slug = label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-");

    const maxSort = await prisma.technique.aggregate({
      _max: { sortOrder: true },
      where: { tierId },
    });

    const technique = await prisma.technique.create({
      data: {
        slug,
        label,
        description,
        tierId,
        sortOrder: (maxSort._max.sortOrder || 0) + 1,
      },
    });

    await logAdminAction(adminId!, "create", "technique", technique.id, { label, tierId });

    res.status(201).json({
      success: true,
      data: technique,
      message: "Technique created successfully",
    });
  } catch (error) {
    console.error("Error creating technique:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to create technique",
    });
  }
});

/**
 * @swagger
 * /api/admin/content/techniques/{id}:
 *   put:
 *     summary: Update technique
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *               description:
 *                 type: string
 *               tierId:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Technique updated
 */
router.put("/techniques/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;
    const { label, description, tierId, isActive, sortOrder } = req.body;

    const updateData: any = {};
    if (label !== undefined) {
      updateData.label = label;
      updateData.slug = label.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    }
    if (description !== undefined) updateData.description = description;
    if (tierId !== undefined) updateData.tierId = tierId;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

    const technique = await prisma.technique.update({
      where: { id },
      data: updateData,
    });

    await logAdminAction(adminId!, "update", "technique", id, { fields: Object.keys(updateData) });

    res.json({
      success: true,
      data: technique,
      message: "Technique updated successfully",
    });
  } catch (error) {
    console.error("Error updating technique:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update technique",
    });
  }
});

/**
 * @swagger
 * /api/admin/content/techniques/{id}:
 *   delete:
 *     summary: Deactivate technique
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Technique deactivated
 */
router.delete("/techniques/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;

    await prisma.technique.update({
      where: { id },
      data: { isActive: false },
    });

    await logAdminAction(adminId!, "delete", "technique", id);

    res.json({
      success: true,
      message: "Technique deactivated successfully",
    });
  } catch (error) {
    console.error("Error deleting technique:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to delete technique",
    });
  }
});

export default router;
