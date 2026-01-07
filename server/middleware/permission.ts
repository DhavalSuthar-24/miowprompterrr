import { Request, Response, NextFunction } from "express";
import { prisma } from "../db";

/**
 * Load user permissions from database and attach to request
 * Use this after authenticate middleware to get fresh permissions
 */
export async function loadPermissions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    next();
    return;
  }

  try {
    // Get user with roles and their permissions
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
                permissions: true,
                rolePermissions: {
                  select: {
                    permission: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: "User not found",
        message: "The authenticated user no longer exists",
      });
      return;
    }

    // Collect all permissions from roles
    const permissions = new Set<string>();

    for (const userRole of user.roles) {
      // Add permissions from role.permissions array
      for (const permission of userRole.role.permissions) {
        permissions.add(permission);
      }

      // Add permissions from rolePermissions relation
      for (const rp of userRole.role.rolePermissions) {
        permissions.add(rp.permission.name);
      }
    }

    // Update user permissions on request
    req.user.permissions = Array.from(permissions);

    next();
  } catch (error) {
    console.error("Error loading permissions:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to load user permissions",
    });
  }
}

/**
 * Middleware to check if user has completed onboarding
 */
export async function requireOnboarding(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
    });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { onboardingCompleted: true },
    });

    if (!user?.onboardingCompleted) {
      res.status(403).json({
        success: false,
        error: "Onboarding required",
        message: "Please complete your profile setup first",
        redirectTo: "/onboarding",
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Error checking onboarding:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
