// @ts-nocheck - Prisma models need migration first
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { authenticate } from "../../middleware/auth";

const router = Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    permissions: string[];
  };
}

/**
 * POST /api/prompts/:promptId/vote
 * Vote on a prompt (upvote: 1, downvote: -1)
 */
router.post("/prompts/:promptId/vote", authenticate, async (req: Request, res: Response) => {
  try {
    const { promptId } = req.params;
    const { value } = req.body;
    const userId = (req as AuthRequest).user?.userId;

    // Validate vote value
    if (value !== 1 && value !== -1) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Vote value must be 1 (upvote) or -1 (downvote)",
      });
      return;
    }

    // Check prompt exists
    const prompt = await prisma.prompt.findUnique({
      where: { id: promptId },
      select: { id: true, authorId: true, upvotes: true, downvotes: true },
    });

    if (!prompt) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Prompt not found",
      });
      return;
    }

    // Prevent self-voting
    if (prompt.authorId === userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You cannot vote on your own prompt",
      });
      return;
    }

    // Check for existing vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_promptId: {
          userId: userId!,
          promptId,
        },
      },
    });

    let voteChange = 0;
    let newVote: number | null = value;

    if (existingVote) {
      if (existingVote.value === value) {
        // Same vote - remove it (toggle off)
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        voteChange = -value;
        newVote = null;
      } else {
        // Different vote - update it
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });
        voteChange = value * 2; // Going from -1 to 1 or 1 to -1
      }
    } else {
      // New vote
      await prisma.vote.create({
        data: {
          userId: userId!,
          promptId,
          value,
        },
      });
      voteChange = value;
    }

    // Calculate new counts
    let upvoteChange = 0;
    let downvoteChange = 0;

    if (existingVote) {
      if (existingVote.value === value) {
        // Removed vote
        if (value === 1) upvoteChange = -1;
        else downvoteChange = -1;
      } else {
        // Changed vote
        if (value === 1) {
          upvoteChange = 1;
          downvoteChange = -1;
        } else {
          upvoteChange = -1;
          downvoteChange = 1;
        }
      }
    } else {
      // New vote
      if (value === 1) upvoteChange = 1;
      else downvoteChange = 1;
    }

    // Update prompt counts
    const updatedPrompt = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        upvotes: { increment: upvoteChange },
        downvotes: { increment: downvoteChange },
        score: { increment: voteChange },
      },
      select: { upvotes: true, downvotes: true, score: true },
    });

    // Update author's total upvotes in stats (fire and forget)
    if (upvoteChange !== 0) {
      prisma.userStats
        .upsert({
          where: { userId: prompt.authorId },
          create: { userId: prompt.authorId, totalUpvotes: Math.max(0, upvoteChange) },
          update: { totalUpvotes: { increment: upvoteChange } },
        })
        .catch(() => {});
    }

    res.json({
      success: true,
      data: {
        userVote: newVote,
        upvotes: updatedPrompt.upvotes,
        downvotes: updatedPrompt.downvotes,
        score: updatedPrompt.score,
      },
      message: newVote === null ? "Vote removed" : newVote === 1 ? "Upvoted" : "Downvoted",
    });
  } catch (error) {
    console.error("Error voting on prompt:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to vote",
    });
  }
});

/**
 * DELETE /api/prompts/:promptId/vote
 * Remove vote from a prompt
 */
router.delete("/prompts/:promptId/vote", authenticate, async (req: Request, res: Response) => {
  try {
    const { promptId } = req.params;
    const userId = (req as AuthRequest).user?.userId;

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_promptId: {
          userId: userId!,
          promptId,
        },
      },
    });

    if (!existingVote) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Vote not found",
      });
      return;
    }

    // Delete vote
    await prisma.vote.delete({
      where: { id: existingVote.id },
    });

    // Update prompt counts
    const updatedPrompt = await prisma.prompt.update({
      where: { id: promptId },
      data: {
        upvotes: existingVote.value === 1 ? { decrement: 1 } : undefined,
        downvotes: existingVote.value === -1 ? { decrement: 1 } : undefined,
        score: { decrement: existingVote.value },
      },
      select: { upvotes: true, downvotes: true, score: true },
    });

    res.json({
      success: true,
      data: {
        userVote: null,
        upvotes: updatedPrompt.upvotes,
        downvotes: updatedPrompt.downvotes,
        score: updatedPrompt.score,
      },
      message: "Vote removed",
    });
  } catch (error) {
    console.error("Error removing vote:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to remove vote",
    });
  }
});

/**
 * POST /api/comments/:commentId/vote
 * Vote on a comment
 */
router.post("/comments/:commentId/vote", authenticate, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { value } = req.body;
    const userId = (req as AuthRequest).user?.userId;

    if (value !== 1 && value !== -1) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Vote value must be 1 (upvote) or -1 (downvote)",
      });
      return;
    }

    // Check comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, authorId: true },
    });

    if (!comment) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Comment not found",
      });
      return;
    }

    // Prevent self-voting
    if (comment.authorId === userId) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "You cannot vote on your own comment",
      });
      return;
    }

    // Check for existing vote
    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_commentId: {
          userId: userId!,
          commentId,
        },
      },
    });

    let voteChange = 0;
    let upvoteChange = 0;
    let newVote: number | null = value;

    if (existingVote) {
      if (existingVote.value === value) {
        // Toggle off
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
        voteChange = -value;
        upvoteChange = value === 1 ? -1 : 0;
        newVote = null;
      } else {
        // Change vote
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { value },
        });
        voteChange = value * 2;
        upvoteChange = value === 1 ? 1 : -1;
      }
    } else {
      // New vote
      await prisma.vote.create({
        data: {
          userId: userId!,
          commentId,
          value,
        },
      });
      voteChange = value;
      upvoteChange = value === 1 ? 1 : 0;
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
        upvotes: { increment: upvoteChange },
        score: { increment: voteChange },
      },
      select: { upvotes: true, score: true },
    });

    res.json({
      success: true,
      data: {
        userVote: newVote,
        upvotes: updatedComment.upvotes,
        score: updatedComment.score,
      },
    });
  } catch (error) {
    console.error("Error voting on comment:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to vote",
    });
  }
});

export default router;
