// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { authenticate, optionalAuthenticate } from "../../middleware/auth";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendForbidden,
  sendValidationError,
  validateMinLength,
  validateMaxLength,
} from "../../utils";
import { AuthRequest } from "../../types/request";

const router = Router();

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
        return sendNotFound(res, "Prompt");
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

      return sendSuccess(res, formattedComments, undefined, 200);
      /* 
       Note: The original code returned { success: true, data: ..., count: ... }
       Our sendSuccess wrapper returns { success: true, data: ..., message: ... }
       If strictly adhering to prior format is needed, we might need a custom response or update 
       sendSuccess to accept extra fields, but the new standard is preferred.
       I'll stick to the new standard response. The `count` can be inferred from data length if needed, 
       or included in data if it was paginated (but here it's just a list).
      */
    } catch (error) {
      return sendError(res, error, "Failed to fetch comments");
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

    return sendSuccess(res, formattedReplies);
  } catch (error) {
    return sendError(res, error, "Failed to fetch replies");
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
      const minLengthError = validateMinLength(content, 2, "Comment");
      if (minLengthError) return sendValidationError(res, minLengthError);

      const maxLengthError = validateMaxLength(content, 5000, "Comment");
      if (maxLengthError) return sendValidationError(res, maxLengthError);

      // Check prompt exists
      const prompt = await prisma.prompt.findUnique({
        where: { id: promptId },
        select: { id: true, status: true },
      });

      if (!prompt || prompt.status !== "PUBLISHED") {
        return sendNotFound(res, "Prompt");
      }

      // If replying, check parent exists
      if (parentId) {
        const parent = await prisma.comment.findUnique({
          where: { id: parentId },
          select: { id: true, promptId: true },
        });

        if (!parent || parent.promptId !== promptId) {
          return sendValidationError(res, "Invalid parent comment");
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

      return sendSuccess(
        res,
        {
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
        "Comment added successfully",
        201
      );
    } catch (error) {
      return sendError(res, error, "Failed to add comment");
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
      return sendNotFound(res, "Comment");
    }

    if (existing.authorId !== userId) {
      return sendForbidden(res, "You can only edit your own comments");
    }

    // Validation
    const minLengthError = validateMinLength(content, 2, "Comment");
    if (minLengthError) return sendValidationError(res, minLengthError);

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

    return sendSuccess(res, comment, "Comment updated successfully");
  } catch (error) {
    return sendError(res, error, "Failed to update comment");
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
      return sendNotFound(res, "Comment");
    }

    if (existing.authorId !== userId) {
      return sendForbidden(res, "You can only delete your own comments");
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

    return sendSuccess(res, null, "Comment deleted successfully");
  } catch (error) {
    return sendError(res, error, "Failed to delete comment");
  }
});

export default router;
