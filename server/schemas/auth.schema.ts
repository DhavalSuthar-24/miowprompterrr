import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("Not a valid email"),
    password: z.string().min(8, "Password too short - should be 8 chars minimum"),
    name: z.string().min(1, "Name is required"),
    username: z.string().min(3, "Username must be at least 3 characters"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Email is required").email(),
    password: z.string().min(1, "Password is required"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .min(8, "Password too short - should be 8 chars minimum"),
  }),
});
