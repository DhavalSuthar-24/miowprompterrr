import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        permissions: string[];
      };
    }
  }
}

/**
 * Authentication middleware
 * Verifies JWT access token from Authorization header
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "No access token provided",
    });
    return;
  }

  const token = authHeader.substring(7); // Remove "Bearer " prefix
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      error: "Invalid token",
      message: "Access token is invalid or expired",
    });
    return;
  }

  // Attach user info to request
  req.user = {
    userId: decoded.userId,
    permissions: decoded.permissions || [],
  };

  next();
}

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if no token
 */
export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (decoded) {
      req.user = {
        userId: decoded.userId,
        permissions: decoded.permissions || [],
      };
    }
  }

  next();
}
