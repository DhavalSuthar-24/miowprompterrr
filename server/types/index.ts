// ============================================================================
// SERVER TYPES
// ============================================================================

// Google OAuth Types
export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  verified_email?: boolean;
}

export interface GoogleTokenInfo {
  aud: string;
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  exp: number;
}

// Express Extensions
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    permissions: string[];
  };
}

// Prisma User with Roles (for typing include results)
export interface UserWithRoles {
  id: string;
  email: string;
  name: string;
  username: string;
  password: string | null;
  dob: Date | null;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  roles: {
    role: {
      name: string;
      permissions: string[];
      rolePermissions: {
        permission: {
          name: string;
        };
      }[];
    };
  }[];
}
