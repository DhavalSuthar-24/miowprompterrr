// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";

const router = Router();

// Type for authenticated request
interface AuthRequest extends Request {
  user?: {
    userId: string;
    permissions: string[];
  };
}

/**
 * GET /api/prompts
 * List prompts with pagination, sorting, and filtering
 */
router.get("/", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = "recent",
      tag,
      personality,
      search,
      featured,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Math.min(Number(limit), 50);
    const userId = (req as AuthRequest).user?.userId;

    // Build where clause
    const where: any = {
      status: "PUBLISHED",
    };

    // Filter by tag
    if (tag) {
      where.tags = {
        some: {
          tag: { slug: tag as string },
        },
      };
    }

    // Filter by personality
    if (personality) {
      where.personality = { slug: personality as string };
    }

    // Filter featured
    if (featured === "true") {
      where.isFeatured = true;
    }

    // Search in title and content
    if (search && typeof search === "string") {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build order by
    let orderBy: any;
    switch (sortBy) {
      case "top":
        orderBy = { score: "desc" };
        break;
      case "hot":
        // Hot = score + recency (simplified: high score recent posts)
        orderBy = [{ score: "desc" }, { createdAt: "desc" }];
        break;
      case "controversial":
        // Posts with high vote count but near-zero score
        orderBy = [{ downvotes: "desc" }, { upvotes: "desc" }];
        break;
      case "views":
        orderBy = { viewCount: "desc" };
        break;
      case "recent":
      default:
        orderBy = { createdAt: "desc" };
    }

    // Fetch prompts
    const prompts = await prisma.prompt.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true,
        title: true,
        content: true,
        upvotes: true,
        downvotes: true,
        score: true,
        viewCount: true,
        copyCount: true,
        isFeatured: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        personality: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
          },
        },
        presetMode: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    // Get total count
    const totalCount = await prisma.prompt.count({ where });

    // Get user's votes if authenticated
    let userVotes: Record<string, number> = {};
    let savedPrompts: Set<string> = new Set();

    if (userId) {
      const [votes, saved] = await Promise.all([
        prisma.vote.findMany({
          where: {
            userId,
            promptId: { in: prompts.map((p) => p.id) },
          },
          select: { promptId: true, value: true },
        }),
        prisma.savedPrompt.findMany({
          where: {
            userId,
            promptId: { in: prompts.map((p) => p.id) },
          },
          select: { promptId: true },
        }),
      ]);

      userVotes = votes.reduce(
        (acc, v) => {
          if (v.promptId) acc[v.promptId] = v.value;
          return acc;
        },
        {} as Record<string, number>
      );

      savedPrompts = new Set(saved.map((s) => s.promptId));
    }

    // Format response
    const formattedPrompts = prompts.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content.substring(0, 300) + (prompt.content.length > 300 ? "..." : ""),
      upvotes: prompt.upvotes,
      downvotes: prompt.downvotes,
      score: prompt.score,
      viewCount: prompt.viewCount,
      copyCount: prompt.copyCount,
      commentCount: prompt._count.comments,
      isFeatured: prompt.isFeatured,
      createdAt: prompt.createdAt,
      author: prompt.author,
      personality: prompt.personality,
      presetMode: prompt.presetMode,
      tags: prompt.tags.map((pt) => pt.tag),
      userVote: userVotes[prompt.id] || null,
      isSaved: savedPrompts.has(prompt.id),
    }));

    res.json({
      success: true,
      data: formattedPrompts,
      pagination: {
        page: Number(page),
        limit: take,
        total: totalCount,
        totalPages: Math.ceil(totalCount / take),
      },
    });
  } catch (error) {
    console.error("Error fetching prompts:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch prompts",
    });
  }
});

/**
 * GET /api/prompts/:id
 * Get single prompt with full details
 */
router.get("/:id", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.userId;

    const prompt = await prisma.prompt.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            image: true,
            createdAt: true,
          },
        },
        personality: {
          select: {
            id: true,
            name: true,
            slug: true,
            icon: true,
            description: true,
          },
        },
        presetMode: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            config: true,
          },
        },
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
                color: true,
              },
            },
          },
        },
        _count: {
          select: { comments: true, savedBy: true },
        },
      },
    });

    if (!prompt) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Prompt not found",
      });
      return;
    }

    // Check if user can view (published or own)
    if (prompt.status !== "PUBLISHED" && prompt.authorId !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You do not have access to this prompt",
      });
      return;
    }

    // Increment view count (fire and forget)
    prisma.prompt
      .update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    // Get user's vote and save status
    let userVote: number | null = null;
    let isSaved = false;

    if (userId) {
      const [vote, saved] = await Promise.all([
        prisma.vote.findFirst({
          where: { userId, promptId: id },
          select: { value: true },
        }),
        prisma.savedPrompt.findFirst({
          where: { userId, promptId: id },
        }),
      ]);

      userVote = vote?.value || null;
      isSaved = !!saved;
    }

    res.json({
      success: true,
      data: {
        id: prompt.id,
        title: prompt.title,
        content: prompt.content,
        upvotes: prompt.upvotes,
        downvotes: prompt.downvotes,
        score: prompt.score,
        viewCount: prompt.viewCount + 1,
        copyCount: prompt.copyCount,
        commentCount: prompt._count.comments,
        saveCount: prompt._count.savedBy,
        isFeatured: prompt.isFeatured,
        status: prompt.status,
        createdAt: prompt.createdAt,
        updatedAt: prompt.updatedAt,
        author: prompt.author,
        personality: prompt.personality,
        presetMode: prompt.presetMode,
        tags: prompt.tags.map((pt) => pt.tag),
        userVote,
        isSaved,
        isOwner: prompt.authorId === userId,
      },
    });
  } catch (error) {
    console.error("Error fetching prompt:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch prompt",
    });
  }
});

/**
 * POST /api/prompts
 * Create a new prompt
 */
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { title, content, personalityId, presetModeId, tagIds, status = "PUBLISHED" } = req.body;

    // Validation
    if (!title || typeof title !== "string" || title.trim().length < 5) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Title must be at least 5 characters",
      });
      return;
    }

    if (!content || typeof content !== "string" || content.trim().length < 20) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Content must be at least 20 characters",
      });
      return;
    }

    // Validate status
    const validStatuses = ["DRAFT", "PUBLISHED"];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Status must be DRAFT or PUBLISHED",
      });
      return;
    }

    // Create prompt
    const prompt = await prisma.prompt.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        authorId: userId!,
        personalityId: personalityId || null,
        presetModeId: presetModeId || null,
        status,
      },
      include: {
        author: {
          select: { id: true, username: true, image: true },
        },
      },
    });

    // Add tags if provided
    if (tagIds && Array.isArray(tagIds) && tagIds.length > 0) {
      await prisma.promptTag.createMany({
        data: tagIds.slice(0, 5).map((tagId: string) => ({
          promptId: prompt.id,
          tagId,
        })),
        skipDuplicates: true,
      });

      // Update tag use counts
      await prisma.tag.updateMany({
        where: { id: { in: tagIds.slice(0, 5) } },
        data: { useCount: { increment: 1 } },
      });
    }

    // Update user stats (fire and forget)
    prisma.userStats
      .upsert({
        where: { userId: userId! },
        create: { userId: userId!, promptCount: 1 },
        update: { promptCount: { increment: 1 } },
      })
      .catch(() => {});

    res.status(201).json({
      success: true,
      data: prompt,
      message: "Prompt created successfully",
    });
  } catch (error) {
    console.error("Error creating prompt:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to create prompt",
    });
  }
});

/**
 * PATCH /api/prompts/:id
 * Update own prompt
 */
router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.userId;
    const { title, content, personalityId, presetModeId, tagIds, status } = req.body;

    // Check ownership
    const existing = await prisma.prompt.findUnique({
      where: { id },
      select: { authorId: true, status: true },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Prompt not found",
      });
      return;
    }

    if (existing.authorId !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You can only edit your own prompts",
      });
      return;
    }

    // Build update data
    const updateData: any = { updatedAt: new Date() };

    if (title && typeof title === "string" && title.trim().length >= 5) {
      updateData.title = title.trim();
    }

    if (content && typeof content === "string" && content.trim().length >= 20) {
      updateData.content = content.trim();
    }

    if (personalityId !== undefined) {
      updateData.personalityId = personalityId || null;
    }

    if (presetModeId !== undefined) {
      updateData.presetModeId = presetModeId || null;
    }

    if (status && ["DRAFT", "PUBLISHED", "HIDDEN"].includes(status)) {
      updateData.status = status;
    }

    // Update prompt
    const prompt = await prisma.prompt.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: { id: true, username: true, image: true },
        },
        tags: {
          include: { tag: true },
        },
      },
    });

    // Update tags if provided
    if (tagIds && Array.isArray(tagIds)) {
      // Remove existing tags
      await prisma.promptTag.deleteMany({
        where: { promptId: id },
      });

      // Add new tags
      if (tagIds.length > 0) {
        await prisma.promptTag.createMany({
          data: tagIds.slice(0, 5).map((tagId: string) => ({
            promptId: id,
            tagId,
          })),
          skipDuplicates: true,
        });
      }
    }

    res.json({
      success: true,
      data: prompt,
      message: "Prompt updated successfully",
    });
  } catch (error) {
    console.error("Error updating prompt:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update prompt",
    });
  }
});

/**
 * DELETE /api/prompts/:id
 * Delete own prompt
 */
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.userId;

    // Check ownership
    const existing = await prisma.prompt.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Prompt not found",
      });
      return;
    }

    if (existing.authorId !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You can only delete your own prompts",
      });
      return;
    }

    // Soft delete (change status)
    await prisma.prompt.update({
      where: { id },
      data: { status: "DELETED" },
    });

    // Update user stats (fire and forget)
    prisma.userStats
      .update({
        where: { userId: userId! },
        data: { promptCount: { decrement: 1 } },
      })
      .catch(() => {});

    res.json({
      success: true,
      message: "Prompt deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting prompt:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to delete prompt",
    });
  }
});

/**
 * POST /api/prompts/:id/copy
 * Increment copy count
 */
router.post("/:id/copy", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const prompt = await prisma.prompt.update({
      where: { id },
      data: { copyCount: { increment: 1 } },
      select: { copyCount: true },
    });

    res.json({
      success: true,
      data: { copyCount: prompt.copyCount },
    });
  } catch (error) {
    console.error("Error incrementing copy count:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to record copy",
    });
  }
});

/**
 * POST /api/prompts/:id/save
 * Save or unsave a prompt
 */
router.post("/:id/save", authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.userId;

    // Check if already saved
    const existing = await prisma.savedPrompt.findUnique({
      where: {
        userId_promptId: {
          userId: userId!,
          promptId: id,
        },
      },
    });

    if (existing) {
      // Unsave
      await prisma.savedPrompt.delete({
        where: { id: existing.id },
      });

      res.json({
        success: true,
        data: { saved: false },
        message: "Prompt unsaved",
      });
    } else {
      // Save
      await prisma.savedPrompt.create({
        data: {
          userId: userId!,
          promptId: id,
        },
      });

      res.json({
        success: true,
        data: { saved: true },
        message: "Prompt saved",
      });
    }
  } catch (error) {
    console.error("Error saving prompt:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to save prompt",
    });
  }
});

export default router;
