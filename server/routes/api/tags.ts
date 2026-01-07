// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";
import {
  sendSuccess,
  sendError,
  sendPaginated,
  sendNotFound,
  sendValidationError,
} from "../../utils";
import { AuthRequest } from "../../types/request";

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

    return sendSuccess(res, tags, undefined, 200);
    // Note: older format had { success: true, count: number, data: ... }. 
    // sendSuccess doesn't add 'count' outside. The client might accept just data array. 
    // If exact compat is needed we could do sendSuccess(res, { tags, count: tags.length }). 
    // But usually returning the array directly as data is cleaner standard.
  } catch (error) {
    return sendError(res, error, "Failed to fetch tags");
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

    return sendSuccess(res, tags);
  } catch (error) {
    return sendError(res, error, "Failed to fetch popular tags");
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
    const userId = (req as AuthRequest).user?.userId;

    // Get tag
    const tag = await prisma.tag.findUnique({
      where: { slug },
    });

    if (!tag) {
      return sendNotFound(res, "Tag");
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

    return sendPaginated(
      res,
      {
        tag,
        prompts: formattedPrompts,
      },
      {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
      }
    );
  } catch (error) {
    return sendError(res, error, "Failed to fetch tag");
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
      return sendValidationError(res, "Tag name must be at least 2 characters");
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
      return sendError(res, null, "A tag with this name already exists", 409);
    }

    const tag = await prisma.tag.create({
      data: {
        name: name.trim(),
        slug,
        color: color || null,
      },
    });

    return sendSuccess(res, tag, "Tag created successfully", 201);
  } catch (error) {
    return sendError(res, error, "Failed to create tag");
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
      return sendSuccess(res, []);
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

    return sendSuccess(res, tags);
  } catch (error) {
    return sendError(res, error, "Failed to search tags");
  }
});

export default router;
