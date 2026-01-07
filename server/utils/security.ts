import crypto from "crypto";

/**
 * Generate a cryptographically secure random state for OAuth CSRF protection
 */
export function generateOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Hash a refresh token for secure storage
 * We store the hash in the database, not the raw token
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Sanitize input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";
  
  // Remove null bytes
  let sanitized = input.replace(/\0/g, "");
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Limit length to prevent DoS
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }
  
  return sanitized;
}

/**
 * Sanitize email specifically
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== "string") return "";
  
  return email.toLowerCase().trim().substring(0, 255);
}

/**
 * Sanitize username
 */
export function sanitizeUsername(username: string): string {
  if (typeof username !== "string") return "";
  
  // Only allow alphanumeric and underscore
  return username.toLowerCase().replace(/[^a-z0-9_]/g, "").substring(0, 50);
}

/**
 * Generate secure random bytes for tokens
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}
