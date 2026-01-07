// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";

const router = Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    permissions: string[];
  };
}

/**
 * GET /api/users/:userId/prompts
 * Get user's public prompts
 */
router.get("/:userId/prompts", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = (req as AuthRequest).user?.userId;
    const skip = (Number(page) - 1) * Number(limit);

    // Check user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        image: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "User not found",
      });
      return;
    }

    // Show all prompts if viewing own profile, otherwise only published
    const isOwner = currentUserId === userId;
    const where: any = {
      authorId: userId,
    };
    if (!isOwner) {
      where.status = "PUBLISHED";
    }

    const prompts = await prisma.prompt.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        content: true,
        upvotes: true,
        downvotes: true,
        score: true,
        viewCount: true,
        status: true,
        createdAt: true,
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
        _count: { select: { comments: true } },
      },
    });

    const totalCount = await prisma.prompt.count({ where });

    // Get user stats
    const stats = await prisma.userStats.findUnique({
      where: { userId },
      select: {
        reputation: true,
        promptCount: true,
        totalUpvotes: true,
      },
    });

    res.json({
      success: true,
      data: {
        user: {
          ...user,
          stats: stats || { reputation: 0, promptCount: 0, totalUpvotes: 0 },
        },
        prompts: prompts.map((p) => ({
          id: p.id,
          title: p.title,
          content: p.content.substring(0, 200) + (p.content.length > 200 ? "..." : ""),
          upvotes: p.upvotes,
          downvotes: p.downvotes,
          score: p.score,
          viewCount: p.viewCount,
          status: p.status,
          commentCount: p._count.comments,
          createdAt: p.createdAt,
          tags: p.tags.map((pt) => pt.tag),
        })),
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching user prompts:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch user prompts",
    });
  }
});

/**
 * GET /api/users/:userId/saved
 * Get user's saved prompts (only owner can view)
 */
router.get("/:userId/saved", authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = (req as AuthRequest).user?.userId;
    const skip = (Number(page) - 1) * Number(limit);

    // Only owner can view saved prompts
    if (currentUserId !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You can only view your own saved prompts",
      });
      return;
    }

    const savedPrompts = await prisma.savedPrompt.findMany({
      where: { userId },
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
      include: {
        prompt: {
          select: {
            id: true,
            title: true,
            content: true,
            upvotes: true,
            score: true,
            viewCount: true,
            createdAt: true,
            status: true,
            author: {
              select: { id: true, username: true, image: true },
            },
            tags: {
              include: {
                tag: {
                  select: { id: true, name: true, slug: true, color: true },
                },
              },
            },
            _count: { select: { comments: true } },
          },
        },
      },
    });

    const totalCount = await prisma.savedPrompt.count({ where: { userId } });

    // Filter out deleted prompts
    const validSaved = savedPrompts.filter((s) => s.prompt.status === "PUBLISHED");

    res.json({
      success: true,
      data: validSaved.map((s) => ({
        savedAt: s.createdAt,
        prompt: {
          id: s.prompt.id,
          title: s.prompt.title,
          content: s.prompt.content.substring(0, 200) + (s.prompt.content.length > 200 ? "..." : ""),
          upvotes: s.prompt.upvotes,
          score: s.prompt.score,
          viewCount: s.prompt.viewCount,
          commentCount: s.prompt._count.comments,
          createdAt: s.prompt.createdAt,
          author: s.prompt.author,
          tags: s.prompt.tags.map((pt) => pt.tag),
        },
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching saved prompts:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch saved prompts",
    });
  }
});

/**
 * GET /api/feed
 * Get personalized feed for authenticated user
 */
router.get("/", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, filter = "hot" } = req.query;
    const userId = (req as AuthRequest).user?.userId;
    const skip = (Number(page) - 1) * Number(limit);

    // Build order
    let orderBy: any;
    switch (filter) {
      case "new":
        orderBy = { createdAt: "desc" };
        break;
      case "top":
        orderBy = { score: "desc" };
        break;
      case "rising":
        // Recent posts with good scores
        orderBy = [{ score: "desc" }, { createdAt: "desc" }];
        break;
      case "hot":
      default:
        // Combination of score and recency
        orderBy = [{ isFeatured: "desc" }, { score: "desc" }, { createdAt: "desc" }];
    }

    const prompts = await prisma.prompt.findMany({
      where: { status: "PUBLISHED" },
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
        isFeatured: true,
        createdAt: true,
        author: {
          select: { id: true, username: true, image: true },
        },
        personality: {
          select: { id: true, name: true, slug: true, icon: true },
        },
        tags: {
          include: {
            tag: {
              select: { id: true, name: true, slug: true, color: true },
            },
          },
        },
        _count: { select: { comments: true } },
      },
    });

    const totalCount = await prisma.prompt.count({
      where: { status: "PUBLISHED" },
    });

    // Get user's votes and saved if authenticated
    let userVotes: Record<string, number> = {};
    let savedPrompts: Set<string> = new Set();

    if (userId) {
      const [votes, saved] = await Promise.all([
        prisma.vote.findMany({
          where: { userId, promptId: { in: prompts.map((p) => p.id) } },
          select: { promptId: true, value: true },
        }),
        prisma.savedPrompt.findMany({
          where: { userId, promptId: { in: prompts.map((p) => p.id) } },
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

    res.json({
      success: true,
      data: prompts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content.substring(0, 300) + (p.content.length > 300 ? "..." : ""),
        upvotes: p.upvotes,
        downvotes: p.downvotes,
        score: p.score,
        viewCount: p.viewCount,
        commentCount: p._count.comments,
        isFeatured: p.isFeatured,
        createdAt: p.createdAt,
        author: p.author,
        personality: p.personality,
        tags: p.tags.map((pt) => pt.tag),
        userVote: userVotes[p.id] || null,
        isSaved: savedPrompts.has(p.id),
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching feed:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch feed",
    });
  }
});

export default router;
