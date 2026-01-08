// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";
import { sendSuccess, sendError, sendPaginated, sendNotFound, sendForbidden } from "../../utils";
import { AuthRequest } from "../../types/request";

const router = Router();



/**
 * @swagger
 * /api/users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               image:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.patch("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { name, bio, image } = req.body;

    if (!userId) return sendForbidden(res, "Not authenticated");

    // Validate inputs
    const updates: any = {};
    if (name) updates.name = sanitizeInput(name).substring(0, 100);
    if (image !== undefined) updates.image = image; // Allow null to remove image
    // Note: Bio isn't in default User model, assuming we might add it or store in metadata/stats if needed.
    // For now, let's just stick to name and image as they are in the schema.

    const user = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        image: true,
      },
    });

    return sendSuccess(res, "Profile updated successfully", { user });
  } catch (error) {
    return sendError(res, error, "Failed to update profile");
  }
});

/**
 * @swagger
 * /api/users/{userId}/prompts:
 *   get:
 *     summary: Get user's public prompts
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User prompts
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
      return sendNotFound(res, "User");
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

    const data = {
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
    };

    return sendPaginated(res, data, {
      page: Number(page),
      limit: Number(limit),
      total: totalCount,
    });

  } catch (error) {
    return sendError(res, error, "Failed to fetch user prompts");
  }
});

/**
 * @swagger
 * /api/users/{userId}/saved:
 *   get:
 *     summary: Get user's saved prompts
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Saved prompts
 */
router.get("/:userId/saved", authenticate, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUserId = (req as AuthRequest).user?.userId;
    const skip = (Number(page) - 1) * Number(limit);

    // Only owner can view saved prompts
    if (currentUserId !== userId) {
      return sendForbidden(res, "You can only view your own saved prompts");
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

    const data = validSaved.map((s) => ({
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
    }));

    return sendPaginated(res, data, {
      page: Number(page),
      limit: Number(limit),
      total: totalCount,
    });

  } catch (error) {
    return sendError(res, error, "Failed to fetch saved prompts");
  }
});

/**
 * @swagger
 * /api/feed:
 *   get:
 *     summary: Get personalized feed
 *     tags: [Feed]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [hot, new, top, rising]
 *     responses:
 *       200:
 *         description: Feed prompts
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

    const data = prompts.map((p) => ({
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
    }));

    return sendPaginated(res, data, {
      page: Number(page),
      limit: Number(limit),
      total: totalCount,
    });

  } catch (error) {
    return sendError(res, error, "Failed to fetch feed");
  }
});

export default router;
