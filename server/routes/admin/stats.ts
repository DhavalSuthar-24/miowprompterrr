// @ts-nocheck - Prisma types
import { Router, Request, Response } from "express";
import { prisma } from "../../db";
import { authenticate } from "../../middleware/auth";
import { requireAdmin, logAdminAction } from "../../middleware/admin";

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate);
router.use(requireAdmin);


// ============================================================================
// DASHBOARD STATS
// ============================================================================

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 */
router.get("/stats", async (_req: Request, res: Response) => {
  try {
    const [
      totalUsers,
      totalPrompts,
      totalComments,
      totalVotes,
      newUsersToday,
      newPromptsToday,
      flaggedPrompts,
      activePersonalities,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.prompt.count({ where: { status: { not: "DELETED" } } }),
      prisma.comment.count(),
      prisma.vote.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.prompt.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.prompt.count({ where: { status: "FLAGGED" } }),
      prisma.personality.count({ where: { isActive: true } }),
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalPrompts,
          totalComments,
          totalVotes,
        },
        today: {
          newUsers: newUsersToday,
          newPrompts: newPromptsToday,
        },
        moderation: {
          flaggedPrompts,
        },
        content: {
          activePersonalities,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch stats",
    });
  }
});

/**
 * @swagger
 * /api/admin/stats/users:
 *   get:
 *     summary: Get user growth statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: User statistics
 */
router.get("/stats/users", async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    // Get daily user signups
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Group by date
    const dailySignups: Record<string, number> = {};
    users.forEach((user) => {
      const date = user.createdAt.toISOString().split("T")[0];
      dailySignups[date] = (dailySignups[date] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        period: Number(days),
        totalNew: users.length,
        dailySignups: Object.entries(dailySignups).map(([date, count]) => ({
          date,
          count,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch user stats",
    });
  }
});

/**
 * @swagger
 * /api/admin/stats/prompts:
 *   get:
 *     summary: Get prompt statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Prompt statistics
 */
router.get("/stats/prompts", async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(days));

    const [byStatus, topPersonalities, recentPrompts] = await Promise.all([
      // Count by status
      prisma.prompt.groupBy({
        by: ["status"],
        _count: { id: true },
      }),
      // Top personalities used
      prisma.prompt.groupBy({
        by: ["personalityId"],
        _count: { id: true },
        where: { personalityId: { not: null } },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
      // Recent prompts
      prisma.prompt.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }),
    ]);

    // Get personality names
    const personalityIds = topPersonalities.map((p) => p.personalityId).filter(Boolean);
    const personalities = await prisma.personality.findMany({
      where: { id: { in: personalityIds as string[] } },
      select: { id: true, name: true },
    });

    const personalityMap = new Map(personalities.map((p) => [p.id, p.name]));

    res.json({
      success: true,
      data: {
        byStatus: byStatus.map((s) => ({
          status: s.status,
          count: s._count.id,
        })),
        topPersonalities: topPersonalities.map((p) => ({
          personalityId: p.personalityId,
          personalityName: personalityMap.get(p.personalityId!) || "Unknown",
          count: p._count.id,
        })),
        recentCount: recentPrompts.length,
      },
    });
  } catch (error) {
    console.error("Error fetching prompt stats:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch prompt stats",
    });
  }
});

// ============================================================================
// USER MANAGEMENT
// ============================================================================

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: List all users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
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
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 */
router.get("/users", async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, search, role, sortBy = "recent" } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    // Search by email or username
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { username: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    // Filter by role
    if (role) {
      where.roles = {
        some: {
          role: { name: role },
        },
      };
    }

    // Order
    const orderBy =
      sortBy === "name"
        ? { name: "asc" as const }
        : sortBy === "email"
          ? { email: "asc" as const }
          : { createdAt: "desc" as const };

    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          image: true,
          emailVerified: true,
          createdAt: true,
          roles: {
            include: {
              role: {
                select: { id: true, name: true },
              },
            },
          },
          _count: {
            select: { prompts: true, comments: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      success: true,
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        roles: user.roles.map((ur) => ur.role),
        promptCount: user._count.prompts,
        commentCount: user._count.comments,
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch users",
    });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}:
 *   get:
 *     summary: Get user details
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
 *         description: User details
 */
router.get("/users/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        dob: true,
        emailVerified: true,
        onboardingCompleted: true,
        createdAt: true,
        updatedAt: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: { permission: true },
                },
              },
            },
          },
        },
        stats: true,
        _count: {
          select: {
            prompts: true,
            comments: true,
            votes: true,
            savedPrompts: true,
          },
        },
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

    // Get recent activity
    const [recentPrompts, recentComments] = await Promise.all([
      prisma.prompt.findMany({
        where: { authorId: id },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, title: true, createdAt: true, status: true },
      }),
      prisma.comment.findMany({
        where: { authorId: id },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          content: true,
          createdAt: true,
          prompt: { select: { id: true, title: true } },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        ...user,
        roles: user.roles.map((ur) => ({
          ...ur.role,
          permissions: ur.role.permissions.map((rp) => rp.permission.name),
        })),
        recentPrompts,
        recentComments: recentComments.map((c) => ({
          id: c.id,
          content: c.content.substring(0, 100),
          createdAt: c.createdAt,
          promptId: c.prompt.id,
          promptTitle: c.prompt.title,
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to fetch user",
    });
  }
});

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Manage user roles
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
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleName, action]
 *             properties:
 *               roleName:
 *                 type: string
 *               action:
 *                 type: string
 *                 enum: [add, remove]
 *     responses:
 *       200:
 *         description: Role updated
 */
router.put("/users/:id/role", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { roleName, action } = req.body; // action: 'add' or 'remove'
    const adminId = (req as AuthRequest).user?.userId;

    if (!roleName || !["add", "remove"].includes(action)) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "roleName and action ('add' or 'remove') required",
      });
      return;
    }

    // Get role
    const role = await prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      res.status(404).json({
        success: false,
        error: "Not found",
        message: "Role not found",
      });
      return;
    }

    if (action === "add") {
      await prisma.userRole.upsert({
        where: {
          userId_roleId: { userId: id, roleId: role.id },
        },
        create: { userId: id, roleId: role.id },
        update: {},
      });
    } else {
      await prisma.userRole.deleteMany({
        where: { userId: id, roleId: role.id },
      });
    }

    // Log action
    await logAdminAction(adminId!, `user_role_${action}`, "user", id, {
      roleName,
    });

    res.json({
      success: true,
      message: `Role ${action === "add" ? "assigned" : "removed"} successfully`,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update user role",
    });
  }
});

export default router;
