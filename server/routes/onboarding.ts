import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { authenticate, loadPermissions } from "../middleware";

const router = Router();

// All onboarding routes require authentication
router.use(authenticate, loadPermissions);

/**
 * GET /onboarding/status
 * Get current onboarding status
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        dob: true,
        onboardingCompleted: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    // Calculate completion percentage
    const fields = {
      name: !!user.name,
      username: !!user.username,
      dob: !!user.dob,
    };

    const completedFields = Object.values(fields).filter(Boolean).length;
    const totalFields = Object.keys(fields).length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    res.json({
      success: true,
      data: {
        completed: user.onboardingCompleted,
        completionPercentage,
        fields,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          dob: user.dob,
        },
      },
    });
  } catch (error) {
    console.error("Get onboarding status error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to get onboarding status",
    });
  }
});

/**
 * PUT /onboarding/profile
 * Update user profile during onboarding
 */
router.put("/profile", async (req: Request, res: Response) => {
  try {
    const { name, username, dob } = req.body;

    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        res.status(400).json({
          success: false,
          error: "Validation error",
          message: "Name must be at least 2 characters",
        });
        return;
      }
      updateData.name = name.trim();
    }

    if (username !== undefined) {
      if (typeof username !== "string" || username.trim().length < 3) {
        res.status(400).json({
          success: false,
          error: "Validation error",
          message: "Username must be at least 3 characters",
        });
        return;
      }

      // Check username format
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) {
        res.status(400).json({
          success: false,
          error: "Validation error",
          message: "Username can only contain letters, numbers, and underscores",
        });
        return;
      }

      // Check if username is taken
      const existingUser = await prisma.user.findFirst({
        where: {
          username: username.toLowerCase(),
          NOT: { id: req.user!.userId },
        },
      });

      if (existingUser) {
        res.status(409).json({
          success: false,
          error: "Username taken",
          message: "This username is already in use",
        });
        return;
      }

      updateData.username = username.toLowerCase();
    }

    if (dob !== undefined) {
      const dobDate = new Date(dob);
      if (isNaN(dobDate.getTime())) {
        res.status(400).json({
          success: false,
          error: "Validation error",
          message: "Invalid date of birth",
        });
        return;
      }

      // Check age (must be at least 13)
      const today = new Date();
      const age = today.getFullYear() - dobDate.getFullYear();
      if (age < 13) {
        res.status(400).json({
          success: false,
          error: "Age restriction",
          message: "You must be at least 13 years old",
        });
        return;
      }

      updateData.dob = dobDate;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({
        success: false,
        error: "No data",
        message: "No valid fields provided to update",
      });
      return;
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        dob: true,
        onboardingCompleted: true,
      },
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to update profile",
    });
  }
});

/**
 * POST /onboarding/complete
 * Mark onboarding as complete
 */
router.post("/complete", async (req: Request, res: Response) => {
  try {
    // Check if all required fields are filled
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        name: true,
        username: true,
        dob: true,
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    const missingFields: string[] = [];
    if (!user.name) missingFields.push("name");
    if (!user.username) missingFields.push("username");

    if (missingFields.length > 0) {
      res.status(400).json({
        success: false,
        error: "Incomplete profile",
        message: `Please complete the following fields: ${missingFields.join(", ")}`,
        missingFields,
      });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { onboardingCompleted: true },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        dob: true,
        onboardingCompleted: true,
      },
    });

    res.json({
      success: true,
      message: "Onboarding completed successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Complete onboarding error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to complete onboarding",
    });
  }
});

export default router;
