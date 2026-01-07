// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";

const router = Router();

/**
 * GET /api/tags
 * Get all tags with use counts, sorted by popularity
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const { limit = 50, sortBy = "useCount" } = req.query;

    const orderBy =
      sortBy === "name"
        ? { name: "asc" as const }
        : sortBy === "recent"
          ? { createdAt: "desc" as const }
          : { useCount: "desc" as const };

    const tags = await prisma.tag.findMany({
      take: Math.min(Number(limit), 100),
      orderBy,
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        useCount: true,
        createdAt: true,
      },
    });

    res.json({
      success: true,
      data: tags,
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
 * GET /api/tags/popular
 * Get top 10 most used tags
 */
router.get("/popular", async (_req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      take: 10,
      orderBy: { useCount: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        useCount: true,
      },
    });

    res.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error("Error fetching popular tags:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch popular tags",
    });
  }
});

/**
 * GET /api/tags/:slug
 * Get single tag with associated prompts
 */
router.get("/:slug", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const { page = 1, limit = 20, sortBy = "recent" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const userId = (req as any).user?.userId;

    // Get tag
    const tag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (!tag) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Tag not found",
      });
      return;
    }

    // Order prompts
    const orderBy =
      sortBy === "top"
        ? { score: "desc" as const }
        : sortBy === "controversial"
          ? { downvotes: "desc" as const }
          : { createdAt: "desc" as const };

    // Get prompts with this tag
    const prompts = await prisma.prompt.findMany({
      where: {
        status: "PUBLISHED",
        tags: {
          some: { tagId: tag.id },
        },
      },
      skip,
      take: Number(limit),
      orderBy,
      select: {
        id: true,
        title: true,
        content: true,
        upvotes: true,
        downvotes: true,
        score: true,
        viewCount: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            image: true,
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

    // Get total count for pagination
    const totalCount = await prisma.prompt.count({
      where: {
        status: "PUBLISHED",
        tags: {
          some: { tagId: tag.id },
        },
      },
    });

    // Check if user has voted on these prompts
    let userVotes: Record<string, number> = {};
    if (userId) {
      const votes = await prisma.vote.findMany({
        where: {
          userId,
          promptId: { in: prompts.map((p) => p.id) },
        },
        select: { promptId: true, value: true },
      });
      userVotes = votes.reduce(
        (acc, v) => {
          if (v.promptId) acc[v.promptId] = v.value;
          return acc;
        },
        {} as Record<string, number>
      );
    }

    // Format response
    const formattedPrompts = prompts.map((prompt) => ({
      id: prompt.id,
      title: prompt.title,
      content: prompt.content.substring(0, 200) + (prompt.content.length > 200 ? "..." : ""),
      upvotes: prompt.upvotes,
      downvotes: prompt.downvotes,
      score: prompt.score,
      viewCount: prompt.viewCount,
      commentCount: prompt._count.comments,
      createdAt: prompt.createdAt,
      author: prompt.author,
      tags: prompt.tags.map((pt) => pt.tag),
      userVote: userVotes[prompt.id] || null,
    }));

    res.json({
      success: true,
      data: {
        tag,
        prompts: formattedPrompts,
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching tag:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch tag",
    });
  }
});

/**
 * POST /api/tags
 * Create a new tag (admin only - will add authorization later)
 */
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const { name, color } = req.body;

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Tag name must be at least 2 characters",
      });
      return;
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check if tag already exists
    const existing = await prisma.tag.findFirst({
      where: {
        OR: [{ slug }, { name: { equals: name, mode: "insensitive" } }],
      },
    });

    if (existing) {
      res.status(409).json({
        success: false,
        error: "Conflict",
        message: "A tag with this name already exists",
      });
      return;
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug,
        color: color || null,
      },
    });

    res.status(201).json({
      success: true,
      data: tag,
      message: "Tag created successfully",
    });
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to create tag",
    });
  }
});

/**
 * GET /api/tags/search
 * Search tags by name (for autocomplete)
 */
router.get("/search/:query", async (req: Request, res: Response) => {
  try {
    const { query } = req.params;

    if (!query || query.length < 1) {
      res.json({ success: true, data: [] });
      return;
    }

    const tags = await prisma.tag.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { slug: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
      orderBy: { useCount: "desc" },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
        useCount: true,
      },
    });

    res.json({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error("Error searching tags:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to search tags",
    });
  }
});

export default router;
