import { Request, Response, NextFunction } from "express";

/**
 * Authorization middleware factory
 * Checks if user has at least one of the required permissions
 */
export function authorize(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // User must be authenticated first
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "You must be logged in to access this resource",
      });
      return;
    }

    const userPermissions = req.user.permissions || [];

    // Check if user has admin:all permission (bypass all checks)
    if (userPermissions.includes("admin:all")) {
      next();
      return;
    }

    // Check if user has at least one required permission
    const hasPermission = requiredPermissions.some((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        error: "Permission denied",
        message: `You need one of these permissions: ${requiredPermissions.join(", ")}`,
        required: requiredPermissions,
        current: userPermissions,
      });
      return;
    }

    next();
  };
}

/**
 * Require all specified permissions (AND logic)
 */
export function authorizeAll(...requiredPermissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required",
        message: "You must be logged in to access this resource",
      });
      return;
    }

    const userPermissions = req.user.permissions || [];

    // Admin bypass
    if (userPermissions.includes("admin:all")) {
      next();
      return;
    }

    // Check if user has ALL required permissions
    const missingPermissions = requiredPermissions.filter(
      (permission) => !userPermissions.includes(permission)
    );

    if (missingPermissions.length > 0) {
      res.status(403).json({
        success: false,
        error: "Permission denied",
        message: `Missing required permissions: ${missingPermissions.join(", ")}`,
        missing: missingPermissions,
      });
      return;
    }

    next();
  };
}

/**
 * Check if user owns the resource (by userId param)
 */
export function authorizeOwner(userIdParam: string = "userId") {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Authentication required",
      });
      return;
    }

    const userPermissions = req.user.permissions || [];

    // Admin bypass
    if (userPermissions.includes("admin:all") || userPermissions.includes("admin:users")) {
      next();
      return;
    }

    const resourceUserId = req.params[userIdParam];

    if (resourceUserId !== req.user.userId) {
      res.status(403).json({
        success: false,
        error: "Access denied",
        message: "You can only access your own resources",
      });
      return;
    }

    next();
  };
}
