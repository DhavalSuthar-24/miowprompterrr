/**
 * Environment Variable Validation
 * Validates required environment variables on application startup
 */

interface EnvConfig {
  DATABASE_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  SERVER_PORT?: string;
  CORS_ORIGIN?: string;
  FRONTEND_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
}

const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

const optionalEnvVars = [
  'SERVER_PORT',
  'CORS_ORIGIN',
  'FRONTEND_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'Cloudname',
  'Cloudinary_API_key',
  'Cloudinary__API_secret',
] as const;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  }

  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:');
    missing.forEach((v) => console.error(`   - ${v}`));
    console.error('\nPlease set these in your .env file or environment.\n');
    process.exit(1);
  }

  // Log optional missing vars as warnings
  const missingOptional = optionalEnvVars.filter((v) => !process.env[v]);
  if (missingOptional.length > 0) {
    console.warn('\n⚠️  Missing optional environment variables:');
    missingOptional.forEach((v) => console.warn(`   - ${v}`));
    console.warn('');
  }

  console.log('✅ Environment validation passed\n');
}

export function getEnv(): EnvConfig {
  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET!,
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
    SERVER_PORT: process.env.SERVER_PORT,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    FRONTEND_URL: process.env.FRONTEND_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  };
}
