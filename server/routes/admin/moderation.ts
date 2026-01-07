// @ts-nocheck - Prisma types
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { authenticate } from "../../middleware/auth";
import { requireAdmin, logAdminAction } from "../../middleware/admin";

const router = Router();

router.use(authenticate);
router.use(requireAdmin);



// ============================================================================
// PROMPT MODERATION
// ============================================================================

/**
 * GET /api/admin/moderation/prompts
 * List all prompts with admin filters
 */
router.get("/prompts", async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, search, sortBy = "recent" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const orderBy =
      sortBy === "score"
        ? { score: "desc" as const }
        : sortBy === "reports"
          ? { status: "desc" as const }
          : { createdAt: "desc" as const };

    const [prompts, totalCount] = await Promise.all([
      prisma.prompt.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        select: {
          id: true,
          title: true,
          content: true,
          status: true,
          isFeatured: true,
          upvotes: true,
          downvotes: true,
          score: true,
          viewCount: true,
          createdAt: true,
          author: {
            select: { id: true, username: true, email: true },
          },
          _count: { select: { comments: true } },
        },
      }),
      prisma.prompt.count({ where }),
    ]);

    res.json({
      success: true,
      data: prompts.map((p) => ({
        ...p,
        content: p.content.substring(0, 200),
        commentCount: p._count.comments,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching prompts for moderation:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch prompts",
    });
  }
});

/**
 * PUT /api/admin/moderation/prompts/:id/status
 * Update prompt status (publish, hide, flag, delete)
 */
router.put("/prompts/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = (req as AuthRequest).user?.userId;

    const validStatuses = ["DRAFT", "PUBLISHED", "HIDDEN", "FLAGGED", "DELETED"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: `status must be one of: ${validStatuses.join(", ")}`,
      });
      return;
    }

    const prompt = await prisma.prompt.update({
      where: { id },
      data: { status },
      select: { id: true, title: true, status: true },
    });

    await logAdminAction(adminId!, "moderate", "prompt", id, { newStatus: status });

    res.json({
      success: true,
      data: prompt,
      message: `Prompt status changed to ${status}`,
    });
  } catch (error) {
    console.error("Error updating prompt status:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update prompt status",
    });
  }
});

/**
 * PUT /api/admin/moderation/prompts/:id/featured
 * Toggle featured status
 */
router.put("/prompts/:id/featured", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    const adminId = (req as AuthRequest).user?.userId;

    const prompt = await prisma.prompt.update({
      where: { id },
      data: { isFeatured: Boolean(featured) },
      select: { id: true, title: true, isFeatured: true },
    });

    await logAdminAction(adminId!, "feature", "prompt", id, { featured: prompt.isFeatured });

    res.json({
      success: true,
      data: prompt,
      message: prompt.isFeatured ? "Prompt featured" : "Prompt unfeatured",
    });
  } catch (error) {
    console.error("Error updating featured status:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update featured status",
    });
  }
});

// ============================================================================
// COMMENT MODERATION
// ============================================================================

/**
 * GET /api/admin/moderation/comments
 * List comments with filters
 */
router.get("/comments", async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    if (search) {
      where.content = { contains: search, mode: "insensitive" };
    }

    const [comments, totalCount] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          upvotes: true,
          score: true,
          createdAt: true,
          author: {
            select: { id: true, username: true },
          },
          prompt: {
            select: { id: true, title: true },
          },
        },
      }),
      prisma.comment.count({ where }),
    ]);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch comments",
    });
  }
});

/**
 * DELETE /api/admin/moderation/comments/:id
 * Hard delete a comment
 */
router.delete("/comments/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;

    await prisma.comment.delete({
      where: { id },
    });

    await logAdminAction(adminId!, "delete", "comment", id);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to delete comment",
    });
  }
});

// ============================================================================
// TAGS MANAGEMENT
// ============================================================================

/**
 * GET /api/admin/moderation/tags
 */
router.get("/tags", async (_req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { useCount: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        useCount: true,
        createdAt: true,
        _count: { select: { prompts: true } },
      },
    });

    res.json({
      success: true,
      data: tags.map((t) => ({
        ...t,
        promptCount: t._count.prompts,
      })),
      count: tags.length,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch tags",
    });
  }
});

/**
 * PUT /api/admin/moderation/tags/:id
 */
router.put("/tags/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;
    const adminId = (req as AuthRequest).user?.userId;

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    }
    if (color !== undefined) updateData.color = color;

    const tag = await prisma.tag.update({
      where: { id },
      data: updateData,
    });

    await logAdminAction(adminId!, "update", "tag", id, { name, color });

    res.json({
      success: true,
      data: tag,
      message: "Tag updated successfully",
    });
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update tag",
    });
  }
});

/**
 * DELETE /api/admin/moderation/tags/:id
 */
router.delete("/tags/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as AuthRequest).user?.userId;

    // Remove tag from all prompts first
    await prisma.promptTag.deleteMany({
      where: { tagId: id },
    });

    // Then delete the tag
    await prisma.tag.delete({
      where: { id },
    });

    await logAdminAction(adminId!, "delete", "tag", id);

    res.json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to delete tag",
    });
  }
});

/**
 * POST /api/admin/moderation/tags/merge
 * Merge multiple tags into one
 */
router.post("/tags/merge", async (req: Request, res: Response) => {
  try {
    const { sourceTagIds, targetTagId } = req.body;
    const adminId = (req as AuthRequest).user?.userId;

    if (!Array.isArray(sourceTagIds) || !targetTagId) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "sourceTagIds (array) and targetTagId required",
      });
      return;
    }

    // Move all prompt associations from source tags to target
    for (const sourceId of sourceTagIds) {
      if (sourceId === targetTagId) continue;

      // Get prompts with source tag
      const promptsWithSource = await prisma.promptTag.findMany({
        where: { tagId: sourceId },
        select: { promptId: true },
      });

      // Add target tag to those prompts (skip if already has it)
      for (const pt of promptsWithSource) {
        await prisma.promptTag.upsert({
          where: {
            promptId_tagId: { promptId: pt.promptId, tagId: targetTagId },
          },
          create: { promptId: pt.promptId, tagId: targetTagId },
          update: {},
        });
      }

      // Delete source tag associations
      await prisma.promptTag.deleteMany({
        where: { tagId: sourceId },
      });

      // Delete source tag
      await prisma.tag.delete({
        where: { id: sourceId },
      });
    }

    // Update target tag use count
    const count = await prisma.promptTag.count({
      where: { tagId: targetTagId },
    });
    await prisma.tag.update({
      where: { id: targetTagId },
      data: { useCount: count },
    });

    await logAdminAction(adminId!, "merge", "tag", targetTagId, {
      merged: sourceTagIds.length,
    });

    res.json({
      success: true,
      message: `Merged ${sourceTagIds.length} tags into target`,
    });
  } catch (error) {
    console.error("Error merging tags:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to merge tags",
    });
  }
});

export default router;
