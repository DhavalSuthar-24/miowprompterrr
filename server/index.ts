import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./config";
import { authRoutes, onboardingRoutes, googleRoutes, apiRoutes, adminRoutes } from "./routes";
import { globalLimiter, configureSecurity } from "./middleware/security";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { globalErrorHandler } from "./middleware/error";

const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set("trust proxy", 1);

// Configure standard security middleware (Helmet, XSS, HPP)
configureSecurity(app);

// CORS configuration
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsers
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Apply global rate limiting
app.use(globalLimiter);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes
app.use("/auth", authRoutes);
app.use("/auth", googleRoutes); // Google OAuth (separate from rate limited auth)
app.use("/onboarding", onboardingRoutes);
app.use("/api", apiRoutes); // Configuration and community API
app.use("/api/admin", adminRoutes); // Admin dashboard API

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Not found",
    message: "The requested endpoint does not exist",
  });
});

// Global error handler
// Global error handler
app.use(globalErrorHandler);

// Start server
// Start server if not in test mode
if (process.env.NODE_ENV !== "test") {
  const server = app.listen(config.port, () => {
    console.log(`
  🚀 MiowNation Server
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📍 Server running on http://localhost:${config.port}
  📚 Documentation: http://localhost:${config.port}/api-docs
  🔐 Auth endpoints: /auth/*
  🔵 Google OAuth: /auth/google
  📋 Onboarding: /onboarding/*
  🌐 API endpoints: /api/*
  ❤️  Health check: /health
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    `);
  });

  // Graceful shutdown
  process.on("SIGTERM", () => {
    console.log("SIGTERM received. Shutting down gracefully...");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });

  process.on("SIGINT", () => {
    console.log("SIGINT received. Shutting down gracefully...");
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  });
}

export default app;
