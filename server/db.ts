/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck - Generated Prisma client has special requirements
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";

// Singleton pattern for Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
