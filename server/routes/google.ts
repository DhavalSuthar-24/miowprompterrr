import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { config } from "../config";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} from "../utils/jwt";
import { generateOAuthState, hashToken, sanitizeEmail } from "../utils/security";
import type { GoogleTokenResponse, GoogleUserInfo, GoogleTokenInfo } from "../types";

const router = Router();

// Google OAuth URLs
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v2/userinfo";

// In-memory state store (use Redis in production for multi-instance)
const oauthStates = new Map<string, { createdAt: number; redirectTo?: string }>();

// Clean up expired states every 5 minutes
setInterval(() => {
  const now = Date.now();
  const maxAge = 10 * 60 * 1000; // 10 minutes
  for (const [state, data] of oauthStates.entries()) {
    if (now - data.createdAt > maxAge) {
      oauthStates.delete(state);
    }
  }
}, 5 * 60 * 1000);

/**
 * GET /auth/google
 * Redirect to Google OAuth consent screen with CSRF state
 */
router.get("/google", (req: Request, res: Response) => {
  if (!config.google.clientId) {
    res.status(500).json({
      success: false,
      error: "Configuration error",
      message: "Google OAuth is not configured",
    });
    return;
  }

  // Generate CSRF state token
  const state = generateOAuthState();
  oauthStates.set(state, { 
    createdAt: Date.now(),
    redirectTo: req.query.redirect as string | undefined
  });

  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: config.google.callbackUrl,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
    state, // CSRF protection
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
});

/**
 * GET /auth/google/callback
 * Handle Google OAuth callback with CSRF validation
 */
router.get("/google/callback", async (req: Request, res: Response) => {
  try {
    const { code, error, state } = req.query;

    // Validate CSRF state
    if (!state || typeof state !== "string" || !oauthStates.has(state)) {
      console.error("Invalid OAuth state - possible CSRF attack");
      res.redirect(`${config.frontendUrl}/auth?error=invalid_state`);
      return;
    }

    const stateData = oauthStates.get(state)!;
    oauthStates.delete(state); // Use state only once

    // Check state age (max 10 minutes)
    if (Date.now() - stateData.createdAt > 10 * 60 * 1000) {
      res.redirect(`${config.frontendUrl}/auth?error=state_expired`);
      return;
    }

    if (error) {
      console.error("Google OAuth error:", error);
      res.redirect(`${config.frontendUrl}/auth?error=oauth_denied`);
      return;
    }

    if (!code || typeof code !== "string") {
      res.redirect(`${config.frontendUrl}/auth?error=no_code`);
      return;
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: config.google.clientId,
        client_secret: config.google.clientSecret,
        redirect_uri: config.google.callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", errorData);
      res.redirect(`${config.frontendUrl}/auth?error=token_exchange_failed`);
      return;
    }

    const tokens = await tokenResponse.json() as GoogleTokenResponse;

    // Get user info from Google
    const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      res.redirect(`${config.frontendUrl}/auth?error=user_info_failed`);
      return;
    }

    const googleUser = await userInfoResponse.json() as GoogleUserInfo;

    // Validate email is present and verified
    if (!googleUser.email) {
      res.redirect(`${config.frontendUrl}/auth?error=no_email`);
      return;
    }

    // Check if account already exists
    let account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: googleUser.id,
        },
      },
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

    let user;

    if (account) {
      // Existing user - update tokens
      await prisma.account.update({
        where: { id: account.id },
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token || account.refresh_token,
          expires_at: tokens.expires_in
            ? Math.floor(Date.now() / 1000) + tokens.expires_in
            : null,
          id_token: tokens.id_token,
        },
      });
      user = account.user;
    } else {
      // Check if user exists with same email
      const existingUser = await prisma.user.findUnique({
        where: { email: sanitizeEmail(googleUser.email) },
      });

      if (existingUser) {
        // Link Google account to existing user
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: "oauth",
            provider: "google",
            providerAccountId: googleUser.id,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: tokens.expires_in
              ? Math.floor(Date.now() / 1000) + tokens.expires_in
              : null,
            token_type: tokens.token_type,
            scope: tokens.scope,
            id_token: tokens.id_token,
          },
        });

        // Mark email as verified
        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerified: true,
            image: existingUser.image || googleUser.picture,
          },
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
      } else {
        // Create new user with Google account
        const defaultRole = await prisma.role.findUnique({
          where: { name: "USER" },
        });

        if (!defaultRole) {
          res.redirect(`${config.frontendUrl}/auth?error=role_not_found`);
          return;
        }

        // Generate unique username from email
        const baseUsername = googleUser.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").substring(0, 40);
        let username = baseUsername || "user";
        let counter = 1;

        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${counter}`;
          counter++;
          if (counter > 1000) {
            // Prevent infinite loop
            username = `user_${Date.now()}`;
            break;
          }
        }

        user = await prisma.user.create({
          data: {
            email: sanitizeEmail(googleUser.email),
            name: (googleUser.name || googleUser.email.split("@")[0]).substring(0, 100),
            username,
            emailVerified: true,
            image: googleUser.picture,
            onboardingCompleted: false,
            roles: {
              create: {
                roleId: defaultRole.id,
              },
            },
            accounts: {
              create: {
                type: "oauth",
                provider: "google",
                providerAccountId: googleUser.id,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expires_at: tokens.expires_in
                  ? Math.floor(Date.now() / 1000) + tokens.expires_in
                  : null,
                token_type: tokens.token_type,
                scope: tokens.scope,
                id_token: tokens.id_token,
              },
            },
          },
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
      }
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

    // Generate JWT tokens
    const accessToken = generateAccessToken(user.id, permissionsArray);
    const refreshToken = generateRefreshToken(user.id);

    // Store HASHED refresh token
    await prisma.refreshToken.create({
      data: {
        token: hashToken(refreshToken),
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
        deviceInfo: req.headers["user-agent"]?.substring(0, 255) || "Google OAuth",
      },
    });

    // Set refresh token as HTTP-only cookie (more secure than URL params)
    res.cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: !config.isDevelopment, // HTTPS in production
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    });

    // Set access token cookie (shorter lived, can be read by frontend)
    res.cookie("access_token", accessToken, {
      httpOnly: false, // Accessible to JS for Authorization header
      secure: !config.isDevelopment,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
    });

    // Redirect with only minimal info (not tokens in URL for security)
    const redirectUrl = stateData.redirectTo || "/";
    res.redirect(
      `${config.frontendUrl}/auth/callback?success=true&onboardingCompleted=${user.onboardingCompleted}&redirect=${encodeURIComponent(redirectUrl)}`
    );
  } catch (error) {
    console.error("Google OAuth error:", error);
    res.redirect(`${config.frontendUrl}/auth?error=server_error`);
  }
});

/**
 * POST /auth/google/token
 * Exchange Google ID token for app tokens (for mobile/SPA flows)
 */
router.post("/google/token", async (req: Request, res: Response) => {
  try {
    const { idToken, accessToken: googleAccessToken } = req.body;

    if (!idToken && !googleAccessToken) {
      res.status(400).json({
        success: false,
        error: "Validation error",
        message: "Either idToken or accessToken is required",
      });
      return;
    }

    // Verify token and get user info
    let googleUser: GoogleUserInfo | undefined;

    if (googleAccessToken) {
      const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      });

      if (!userInfoResponse.ok) {
        res.status(401).json({
          success: false,
          error: "Invalid token",
          message: "Could not verify Google access token",
        });
        return;
      }

      googleUser = await userInfoResponse.json() as GoogleUserInfo;
    } else {
      // Verify ID token with Google
      const tokenInfoResponse = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      );

      if (!tokenInfoResponse.ok) {
        res.status(401).json({
          success: false,
          error: "Invalid token",
          message: "Could not verify Google ID token",
        });
        return;
      }

      const tokenInfo = await tokenInfoResponse.json() as GoogleTokenInfo;

      // Verify audience matches our client ID
      if (tokenInfo.aud !== config.google.clientId) {
        res.status(401).json({
          success: false,
          error: "Invalid token",
          message: "Token was not issued for this application",
        });
        return;
      }

      googleUser = {
        id: tokenInfo.sub,
        email: tokenInfo.email,
        name: tokenInfo.name,
        picture: tokenInfo.picture,
      };
    }

    // Validate email
    if (!googleUser.email) {
      res.status(400).json({
        success: false,
        error: "Invalid response",
        message: "No email in Google user info",
      });
      return;
    }

    // Find or create user
    let account = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: googleUser.id,
        },
      },
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

    let user;

    if (account) {
      user = account.user;
    } else {
      const existingUser = await prisma.user.findUnique({
        where: { email: sanitizeEmail(googleUser.email) },
      });

      if (existingUser) {
        await prisma.account.create({
          data: {
            userId: existingUser.id,
            type: "oauth",
            provider: "google",
            providerAccountId: googleUser.id,
          },
        });

        user = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            emailVerified: true,
            image: existingUser.image || googleUser.picture,
          },
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
      } else {
        const defaultRole = await prisma.role.findUnique({
          where: { name: "USER" },
        });

        if (!defaultRole) {
          res.status(500).json({
            success: false,
            error: "Configuration error",
            message: "Default role not found",
          });
          return;
        }

        const baseUsername = googleUser.email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "").substring(0, 40);
        let username = baseUsername || "user";
        let counter = 1;

        while (await prisma.user.findUnique({ where: { username } })) {
          username = `${baseUsername}${counter}`;
          counter++;
          if (counter > 1000) {
            username = `user_${Date.now()}`;
            break;
          }
        }

        user = await prisma.user.create({
          data: {
            email: sanitizeEmail(googleUser.email),
            name: (googleUser.name || googleUser.email.split("@")[0]).substring(0, 100),
            username,
            emailVerified: true,
            image: googleUser.picture,
            onboardingCompleted: false,
            roles: {
              create: {
                roleId: defaultRole.id,
              },
            },
            accounts: {
              create: {
                type: "oauth",
                provider: "google",
                providerAccountId: googleUser.id,
              },
            },
          },
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
      }
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
        deviceInfo: req.headers["user-agent"]?.substring(0, 255) || "Google Token Exchange",
      },
    });

    res.json({
      success: true,
      message: "Google authentication successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.image,
          onboardingCompleted: user.onboardingCompleted,
          roles: user.roles.map((ur: any) => ur.role.name),
          permissions: permissionsArray,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Google token exchange error:", error);
    res.status(500).json({
      success: false,
      error: "Server error",
      message: "Failed to authenticate with Google",
    });
  }
});

export default router;
