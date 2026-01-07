// @ts-nocheck - Prisma types
import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";

interface AuthRequest extends Request {
  user?: {
    userId: string;
    permissions: string[];
  };
}

/**
 * Middleware to require admin role
 * Must be used after authenticate middleware
 */
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    // Check if user has ADMIN role
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId,
        role: {
          name: "ADMIN",
        },
      },
      include: {
        role: true,
      },
    });

    if (!userRole) {
      res.status(403).json({
        success: false,
        error: "Forbidden",
        message: "Admin access required",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Authorization check failed",
    });
  }
};

/**
 * Middleware to require specific permission
 * Must be used after authenticate middleware
 * @param permission - Permission string to check (e.g., 'admin:users:manage')
 */
export const requirePermission = (permission: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as AuthRequest).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          error: "Unauthorized",
          message: "Authentication required",
        });
        return;
      }

      // Get user's roles and their permissions
      const userRoles = await prisma.userRole.findMany({
        where: { userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      // Collect all permissions
      const userPermissions = new Set<string>();
      for (const userRole of userRoles) {
        for (const rolePermission of userRole.role.permissions) {
          userPermissions.add(rolePermission.permission.name);
        }
      }

      // Check if user has required permission or wildcard
      const hasPermission =
        userPermissions.has(permission) ||
        userPermissions.has("*") ||
        userPermissions.has(permission.split(":").slice(0, -1).join(":") + ":*");

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          error: "Forbidden",
          message: `Permission '${permission}' required`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("Permission middleware error:", error);
      res.status(500).json({
        success: false,
        error: "Server error",
        message: "Permission check failed",
      });
    }
  };
};

/**
 * Log admin action for audit trail
 */
export const logAdminAction = async (
  userId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  details?: Record<string, unknown>
): Promise<void> => {
  try {
    // For now, just console log. Can be expanded to database table later.
    console.log(
      `[ADMIN ACTION] User: ${userId} | Action: ${action} | Entity: ${entityType}${entityId ? `/${entityId}` : ""} | Details: ${JSON.stringify(details || {})}`
    );
    // Future: prisma.adminLog.create({ data: { userId, action, entityType, entityId, details } });
  } catch (error) {
    console.error("Failed to log admin action:", error);
  }
};
