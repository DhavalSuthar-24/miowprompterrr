import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { hashPassword, verifyPassword, validatePasswordStrength } from "../utils/password";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} from "../utils/jwt";
import { hashToken, sanitizeEmail, sanitizeUsername, sanitizeInput } from "../utils/security";
import { authenticate, loadPermissions } from "../middleware";

const router = Router();

/**
 * POST /auth/register
 * Register a new user with email/password
 */
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, name, username } = req.body;

    // Validation
    if (!email || !password || !name || !username) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Email, password, name, and username are required",
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Invalid email format",
      });
      return;
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      res.status(400).json({
        success: false,
        error: "Weak password",
        message: passwordValidation.errors[0],
        errors: passwordValidation.errors,
      });
      return;
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email: sanitizeEmail(email) },
    });

    if (existingEmail) {
      res.status(409).json({
        success: false,
        error: "Email exists",
        message: "An account with this email already exists",
      });
      return;
    }

    // Check if username already exists
    const sanitizedUsername = sanitizeUsername(username);
    if (sanitizedUsername.length < 3) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Username must be at least 3 characters (letters, numbers, underscore only)",
      });
      return;
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: sanitizedUsername },
    });

    if (existingUsername) {
      res.status(409).json({
        success: false,
        error: "Username exists",
        message: "This username is already taken",
      });
      return;
    }

    // Get default USER role
    const defaultRole = await prisma.role.findUnique({
      where: { name: "USER" },
    });

    if (!defaultRole) {
      res.status(500).json({
        success: false,
        error: "Configuration error",
        message: "Default user role not found. Please run database seed.",
      });
      return;
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with default role
    const user = await prisma.user.create({
      data: {
        email: sanitizeEmail(email),
        password: hashedPassword,
        name: sanitizeInput(name).substring(0, 100),
        username: sanitizedUsername,
        onboardingCompleted: false,
        roles: {
          create: {
            roleId: defaultRole.id,
          },
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    // Get permissions from role
    const permissions = user.roles.flatMap((ur: { role: { permissions: string[] } }) => ur.role.permissions);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, permissions);
    const refreshToken = generateRefreshToken(user.id);

    // Store HASHED refresh token in database
    await prisma.refreshToken.create({
      data: {
        token: hashToken(refreshToken),
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
        deviceInfo: req.headers["user-agent"]?.substring(0, 255) || null,
      },
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          onboardingCompleted: user.onboardingCompleted,
          roles: user.roles.map((ur: { role: { name: string } }) => ur.role.name),
          permissions,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to create account",
    });
  }
});

/**
 * POST /auth/login
 * Login with email/password
 */
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Email and password are required",
      });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: sanitizeEmail(email) },
      include: {
        roles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
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
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
      return;
    }

    // Check if user has a password (OAuth-only users may not)
    if (!user.password) {
      res.status(401).json({
        success: false,
        error: "OAuth account",
        message: "This account uses Google sign-in. Please use 'Continue with Google' instead.",
      });
      return;
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: "Invalid credentials",
        message: "Email or password is incorrect",
      });
      return;
    }

    // Collect permissions
    const permissions = new Set<string>();
    for (const userRole of user.roles) {
      for (const p of userRole.role.permissions) {
        permissions.add(p);
      }
      for (const rp of userRole.role.rolePermissions) {
        permissions.add(rp.permission.name);
      }
    }
    const permissionsArray = Array.from(permissions);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, permissionsArray);
    const refreshToken = generateRefreshToken(user.id);

    // Store HASHED refresh token
    await prisma.refreshToken.create({
      data: {
        token: hashToken(refreshToken),
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
        deviceInfo: req.headers["user-agent"]?.substring(0, 255) || null,
      },
    });

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          onboardingCompleted: user.onboardingCompleted,
          roles: user.roles.map((ur: { role: { name: string } }) => ur.role.name),
          permissions: permissionsArray,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to login",
    });
  }
});

/**
 * POST /auth/refresh
 * Get new access token using refresh token
 */
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Refresh token is required",
      });
      return;
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    if (!decoded) {
      res.status(401).json({
        success: false,
        error: "Invalid token",
        message: "Refresh token is invalid or expired",
      });
      return;
    }

    // Check if HASHED token exists in database
    const tokenHash = hashToken(refreshToken);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: tokenHash },
      include: {
        user: {
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    rolePermissions: {
                      include: {
                        permission: true,
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

    if (!storedToken) {
      res.status(401).json({
        success: false,
        error: "Token revoked",
        message: "This refresh token has been revoked",
      });
      return;
    }

    // Check if expired
    if (storedToken.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      res.status(401).json({
        success: false,
        error: "Token expired",
        message: "Refresh token has expired",
      });
      return;
    }

    const user = storedToken.user;

    // Collect permissions
    const permissions = new Set<string>();
    for (const userRole of user.roles) {
      for (const p of userRole.role.permissions) {
        permissions.add(p);
      }
      for (const rp of userRole.role.rolePermissions) {
        permissions.add(rp.permission.name);
      }
    }
    const permissionsArray = Array.from(permissions);

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, permissionsArray);

    // Optionally rotate refresh token
    const newRefreshToken = generateRefreshToken(user.id);

    // Delete old token and create new one (with hash)
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    await prisma.refreshToken.create({
      data: {
        token: hashToken(newRefreshToken),
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
        deviceInfo: req.headers["user-agent"]?.substring(0, 255) || null,
      },
    });

    res.json({
      success: true,
      message: "Token refreshed",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    console.error("Token refresh error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to refresh token",
    });
  }
});

/**
 * POST /auth/logout
 * Invalidate refresh token
 */
router.post("/logout", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete specific refresh token (by hash)
      await prisma.refreshToken.deleteMany({
        where: { token: hashToken(refreshToken) },
      });
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to logout",
    });
  }
});

/**
 * POST /auth/logout-all
 * Invalidate all refresh tokens for user (requires auth)
 */
router.post("/logout-all", authenticate, async (req: Request, res: Response) => {
  try {
    await prisma.refreshToken.deleteMany({
      where: { userId: req.user!.userId },
    });

    res.json({
      success: true,
      message: "Logged out from all devices",
    });
  } catch (error) {
    console.error("Logout all error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to logout from all devices",
    });
  }
});

/**
 * GET /auth/me
 * Get current authenticated user
 */
router.get("/me", authenticate, loadPermissions, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        dob: true,
        emailVerified: true,
        onboardingCompleted: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: {
        ...user,
        roles: user.roles.map((ur: { role: { name: string } }) => ur.role.name),
        permissions: req.user!.permissions,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to get user data",
    });
  }
});

export default router;
