import rateLimit from "express-rate-limit";
import helmet from "helmet";
import xss from "xss-clean";
import hpp from "hpp";
import { Express } from "express";

/**
 * Configure Global Rate Limiter
 * 100 requests per 15 minutes per IP
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300, 
  standardHeaders: true,
  legacyHeaders: true,
  message: {
    success: false,
    error: "Too Many Requests",
    message: "Too many requests from this IP, please try again later.",
  },
});

/**
 * Configure Auth Rate Limiter (stricter)
 * 20 requests per 15 minutes per IP (prevent brute force)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: true,
  message: {
    success: false,
    error: "Too Many Requests",
    message: "Too many login/register attempts, please try again later.",
  },
});

/**
 * Apply security middleware to the Express app
 */
export const configureSecurity = (app: Express) => {
  // Set security HTTP headers
  app.use(helmet());

  // Prevent XSS attacks
  // @ts-ignore - xss-clean types are tricky or missing
  app.use(xss());

  // Prevent HTTP Parameter Pollution
  app.use(hpp());
};
