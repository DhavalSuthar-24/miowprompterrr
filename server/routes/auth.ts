import { Router, Request, Response } from "express";
import { AuthRequest } from "../types/request";
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
import { authLimiter } from "../middleware/security";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name, username]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email or Username exists
 */
router.post("/register", authLimiter, async (req: Request, res: Response) => {
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
          image: user.image,
          dob: user.dob,
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
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authLimiter, async (req: Request, res: Response) => {
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
          image: user.image,
          dob: user.dob,
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
 * POST /auth/change-password
 * Change current user's password
 */
router.post("/change-password", authenticate, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as AuthRequest).user?.userId;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Current and new password are required",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      res.status(404).json({
        success: false,
        error: "User not found",
        message: "User not found or uses external auth",
      });
      return;
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: "Invalid password",
        message: "Current password is incorrect",
      });
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      res.status(400).json({
        success: false,
        error: "Weak password",
        message: passwordValidation.errors[0],
        errors: passwordValidation.errors,
      });
      return;
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Revoke all refresh tokens (security best practice)
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    res.json({
      success: true,
      message: "Password changed successfully. Please login again.",
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to change password",
    });
  }
});

/**
 * POST /auth/refresh
 * Get new access token using refresh token
 */
router.post("/refresh", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken || req.cookies.refresh_token;

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
      try {
        await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      } catch (e: any) {
        // Ignore if already deleted
        if (e.code !== "P2025") throw e;
      }
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

    // Reuse existing refresh token to prevent race conditions (idempotent refresh)
    const newRefreshToken = refreshToken;

    // We do NOT rotate the refresh token here. 
    // This allows multiple concurrent requests to succeed without invalidating each other.
    // Security note: The token is valid for 7 days. Revocation is handled via /logout.

    /* 
    DISABLE ROTATION FOR STABILITY
    // Optionally rotate refresh token
    const newRefreshToken = generateRefreshToken(user.id);
    ... delete and create logic ...
    */


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
    const refreshToken = req.body.refreshToken || req.cookies.refresh_token;

    if (refreshToken) {
      // Delete specific refresh token (by hash)
      await prisma.refreshToken.deleteMany({
        where: { token: hashToken(refreshToken) },
      });
    }

    // Clear cookies
    res.clearCookie("refresh_token");
    res.clearCookie("access_token");

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
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
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
        image: true,
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

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request a password reset email
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reset email sent (always returns success for security)
 */
router.post("/forgot-password", authLimiter, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Email is required",
      });
      return;
    }

    // Always respond with success for security (don't reveal if email exists)
    const successResponse = {
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    };

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: sanitizeEmail(email) },
    });

    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      res.json(successResponse);
      return;
    }

    // Check if user has password (OAuth-only users can't reset)
    if (!user.password) {
      res.json(successResponse);
      return;
    }

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Generate secure reset token
    const resetToken = crypto.randomUUID() + "-" + crypto.randomUUID();
    const tokenHash = hashToken(resetToken);

    // Store HASHED token with 1 hour expiry
    await prisma.passwordResetToken.create({
      data: {
        token: tokenHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    // In production, send email here. For now, log the token.
    // TODO: Integrate email service (SendGrid, Resend, etc.)
    console.log(`[Password Reset] Token for ${email}: ${resetToken}`);
    console.log(`[Password Reset] Reset URL: /reset-password?token=${resetToken}`);

    res.json(successResponse);
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to process password reset request",
    });
  }
});

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password using token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, password]
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 *       400:
 *         description: Invalid or expired token
 */
router.post("/reset-password", authLimiter, async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Token and password are required",
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

    // Find token by hash
    const tokenHash = hashToken(token);
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
      include: { user: true },
    });

    if (!resetToken) {
      res.status(400).json({
        success: false,
        error: "Invalid token",
        message: "This password reset link is invalid or has already been used.",
      });
      return;
    }

    // Check if expired
    if (resetToken.expiresAt < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      res.status(400).json({
        success: false,
        error: "Token expired",
        message: "This password reset link has expired. Please request a new one.",
      });
      return;
    }

    // Check if already used
    if (resetToken.used) {
      res.status(400).json({
        success: false,
        error: "Token used",
        message: "This password reset link has already been used.",
      });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update password and mark token as used
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
      // Revoke all refresh tokens for security
      prisma.refreshToken.deleteMany({
        where: { userId: resetToken.userId },
      }),
    ]);

    res.json({
      success: true,
      message: "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to reset password",
    });
  }
});

/**
 * @swagger
 * /auth/change-password:
 *   post:
 *     summary: Change current user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid password
 */
router.post("/change-password", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Current and new passwords are required",
      });
      return;
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      res.status(400).json({
        success: false,
        error: "Invalid user",
        message: "User not found or uses social login",
      });
      return;
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      res.status(400).json({
        success: false,
        error: "Invalid password",
        message: "Incorrect current password",
      });
      return;
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      res.status(400).json({
        success: false,
        error: "Weak password",
        message: passwordValidation.errors[0],
        errors: passwordValidation.errors,
      });
      return;
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to change password",
    });
  }
});

export default router;
