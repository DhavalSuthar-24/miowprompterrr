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
 * GET /api/prompts/:promptId/comments
 * Get threaded comments for a prompt
 */
router.get(
  "/prompts/:promptId/comments",
  optionalAuthenticate,
  async (req: Request, res: Response) => {
    try {
      const { promptId } = req.params;
      const { sortBy = "top" } = req.query;
      const userId = (req as AuthRequest).user?.userId;

      // Check prompt exists
      const promptExists = await prisma.prompt.findUnique({
        where: { id: promptId },
        select: { id: true },
      });

      if (!promptExists) {
        res.status(404).json({
          success: false,
          error: "Not found",
          message: "Prompt not found",
        });
        return;
      }

      // Order
      const orderBy =
        sortBy === "new"
          ? { createdAt: "desc" as const }
          : sortBy === "old"
            ? { createdAt: "asc" as const }
            : { score: "desc" as const };

      // Get top-level comments (no parent)
      const comments = await prisma.comment.findMany({
        where: {
          promptId,
          parentId: null,
        },
        orderBy,
        select: {
          id: true,
          content: true,
          upvotes: true,
          score: true,
          createdAt: true,
          updatedAt: true,
          author: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
          _count: {
            select: { replies: true },
          },
          replies: {
            orderBy: { score: "desc" },
            take: 3, // Show first 3 replies inline
            select: {
              id: true,
              content: true,
              upvotes: true,
              score: true,
              createdAt: true,
              author: {
                select: {
                  id: true,
                  username: true,
                  image: true,
                },
              },
              _count: {
                select: { replies: true },
              },
            },
          },
        },
      });

      // Get user's votes if authenticated
      let userVotes: Record<string, number> = {};
      if (userId) {
        const allCommentIds = comments.flatMap((c) => [c.id, ...c.replies.map((r: any) => r.id)]);

        const votes = await prisma.vote.findMany({
          where: {
            userId,
            commentId: { in: allCommentIds },
          },
          select: { commentId: true, value: true },
        });

        userVotes = votes.reduce(
          (acc, v) => {
            if (v.commentId) acc[v.commentId] = v.value;
            return acc;
          },
          {} as Record<string, number>
        );
      }

      // Format response
      const formattedComments = comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        upvotes: comment.upvotes,
        score: comment.score,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: comment.author,
        replyCount: comment._count.replies,
        hasMoreReplies: comment._count.replies > 3,
        userVote: userVotes[comment.id] || null,
        isOwner: comment.author.id === userId,
        replies: comment.replies.map((reply: any) => ({
          id: reply.id,
          content: reply.content,
          upvotes: reply.upvotes,
          score: reply.score,
          createdAt: reply.createdAt,
          author: reply.author,
          replyCount: reply._count.replies,
          userVote: userVotes[reply.id] || null,
          isOwner: reply.author.id === userId,
        })),
      }));

      res.json({
        success: true,
        data: formattedComments,
        count: comments.length,
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
        message: "Failed to fetch comments",
      });
    }
  }
);

/**
 * GET /api/comments/:commentId/replies
 * Get all replies for a comment
 */
router.get("/:commentId/replies", optionalAuthenticate, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const userId = (req as AuthRequest).user?.userId;

    const replies = await prisma.comment.findMany({
      where: { parentId: commentId },
      orderBy: { score: "desc" },
      select: {
        id: true,
        content: true,
        upvotes: true,
        score: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            username: true,
            image: true,
          },
        },
        _count: {
          select: { replies: true },
        },
      },
    });

    // Get user votes
    let userVotes: Record<string, number> = {};
    if (userId) {
      const votes = await prisma.vote.findMany({
        where: {
          userId,
          commentId: { in: replies.map((r) => r.id) },
        },
        select: { commentId: true, value: true },
      });

      userVotes = votes.reduce(
        (acc, v) => {
          if (v.commentId) acc[v.commentId] = v.value;
          return acc;
        },
        {} as Record<string, number>
      );
    }

    const formattedReplies = replies.map((reply) => ({
      id: reply.id,
      content: reply.content,
      upvotes: reply.upvotes,
      score: reply.score,
      createdAt: reply.createdAt,
      author: reply.author,
      replyCount: reply._count.replies,
      userVote: userVotes[reply.id] || null,
      isOwner: reply.author.id === userId,
    }));

    res.json({
      success: true,
      data: formattedReplies,
    });
  } catch (error) {
    console.error("Error fetching replies:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch replies",
    });
  }
});

/**
 * POST /api/prompts/:promptId/comments
 * Add a comment to a prompt
 */
router.post(
  "/prompts/:promptId/comments",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { promptId } = req.params;
      const { content, parentId } = req.body;
      const userId = (req as AuthRequest).user?.userId;

      // Validation
      if (!content || typeof content !== "string" || content.trim().length < 2) {
        res.status(400).json({
          success: false,
          error: "Validation error",
          message: "Comment must be at least 2 characters",
        });
        return;
      }

      if (content.length > 5000) {
        res.status(400).json({
          success: false,
          error: "Validation error",
          message: "Comment must be less than 5000 characters",
        });
        return;
      }

      // Check prompt exists
      const prompt = await prisma.prompt.findUnique({
        where: { id: promptId },
        select: { id: true, status: true },
      });

      if (!prompt || prompt.status !== "PUBLISHED") {
        res.status(404).json({
          success: false,
          error: "Not found",
          message: "Prompt not found",
        });
        return;
      }

      // If replying, check parent exists
      if (parentId) {
        const parent = await prisma.comment.findUnique({
          where: { id: parentId },
          select: { id: true, promptId: true },
        });

        if (!parent || parent.promptId !== promptId) {
          res.status(400).json({
            success: false,
            error: "Validation error",
            message: "Invalid parent comment",
          });
          return;
        }
      }

      // Create comment
      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          authorId: userId!,
          promptId,
          parentId: parentId || null,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              image: true,
            },
          },
        },
      });

      // Update user stats (fire and forget)
      prisma.userStats
        .upsert({
          where: { userId: userId! },
          create: { userId: userId!, commentCount: 1 },
          update: { commentCount: { increment: 1 } },
        })
        .catch(() => {});

      res.status(201).json({
        success: true,
        data: {
          id: comment.id,
          content: comment.content,
          upvotes: 0,
          score: 0,
          createdAt: comment.createdAt,
          author: comment.author,
          replyCount: 0,
          userVote: null,
          isOwner: true,
        },
        message: "Comment added successfully",
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
        message: "Failed to add comment",
      });
    }
  }
);

/**
 * PATCH /api/comments/:id
 * Edit own comment
 */
router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = (req as AuthRequest).user?.userId;

    // Check ownership
    const existing = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Comment not found",
      });
      return;
    }

    if (existing.authorId !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You can only edit your own comments",
      });
      return;
    }

    // Validation
    if (!content || typeof content !== "string" || content.trim().length < 2) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Comment must be at least 2 characters",
      });
      return;
    }

    const comment = await prisma.comment.update({
      where: { id },
      data: {
        content: content.trim(),
        updatedAt: new Date(),
      },
      include: {
        author: {
          select: { id: true, username: true, image: true },
        },
      },
    });

    res.json({
      success: true,
      data: comment,
      message: "Comment updated successfully",
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update comment",
    });
  }
});

/**
 * DELETE /api/comments/:id
 * Delete own comment
 */
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as AuthRequest).user?.userId;

    // Check ownership
    const existing = await prisma.comment.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Comment not found",
      });
      return;
    }

    if (existing.authorId !== userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You can only delete your own comments",
      });
      return;
    }

    // Replace content with [deleted] instead of hard delete
    await prisma.comment.update({
      where: { id },
      data: {
        content: "[deleted]",
      },
    });

    // Update user stats (fire and forget)
    prisma.userStats
      .update({
        where: { userId: userId! },
        data: { commentCount: { decrement: 1 } },
      })
      .catch(() => {});

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

export default router;
