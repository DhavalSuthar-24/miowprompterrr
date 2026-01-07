import jwt, { SignOptions } from "jsonwebtoken";
import { config, parseDuration } from "../config";

export interface TokenPayload {
  userId: string;
  permissions?: string[];
  type: "access" | "refresh";
}

export interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

/**
 * Generate an access token (short-lived)
 */
export function generateAccessToken(
  userId: string,
  permissions: string[] = []
): string {
  const payload: TokenPayload = {
    userId,
    permissions,
    type: "access",
  };

  const options: SignOptions = {
    expiresIn: config.jwt.accessExpiry as any,
  };

  return jwt.sign(payload, config.jwt.accessSecret, options);
}

/**
 * Generate a refresh token (long-lived)
 */
export function generateRefreshToken(userId: string): string {
  const payload: TokenPayload = {
    userId,
    type: "refresh",
  };

  const options: SignOptions = {
    expiresIn: config.jwt.refreshExpiry as any,
  };

  return jwt.sign(payload, config.jwt.refreshSecret, options);
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as DecodedToken;
    if (decoded.type !== "access") return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as DecodedToken;
    if (decoded.type !== "refresh") return null;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Get refresh token expiry date
 */
export function getRefreshTokenExpiry(): Date {
  const expiryMs = parseDuration(config.jwt.refreshExpiry);
  return new Date(Date.now() + expiryMs);
}
