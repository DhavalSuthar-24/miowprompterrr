// @ts-nocheck - Using dynamic require for Prisma client with custom output
import "dotenv/config";
import { seedPersonalities } from "./seed/personalities";
import { seedPresetModes } from "./seed/presets";
import { seedTiers } from "./seed/tiers";
import { seedTaskTypes } from "./seed/taskTypes";
import { seedReasoningTemplates } from "./seed/reasoningTemplates";
import { seedQuickTemplates } from "./seed/quickTemplates";
import { seedSelectOptions } from "./seed/selectOptions";
import { seedRolesAndPermissions } from "./seed/permissions";

// Dynamic import of prisma from generated location
const { PrismaClient } = require("../src/generated/prisma/client");

// Initialize with accelerateUrl for Prisma 7
const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL,
});

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Phase 1: Roles and Permissions (existing)
  console.log("📋 Seeding roles and permissions...");
  await seedRolesAndPermissions(prisma);
  console.log("✅ Roles and permissions seeded\n");

  // Phase 2: Core Configuration Entities
  console.log("🎭 Seeding personalities...");
  await seedPersonalities(prisma);
  console.log("✅ Personalities seeded\n");

  console.log("⚙️ Seeding preset modes...");
  await seedPresetModes(prisma);
  console.log("✅ Preset modes seeded\n");

  console.log("📊 Seeding tiers and techniques...");
  await seedTiers(prisma);
  console.log("✅ Tiers and techniques seeded\n");

  console.log("📝 Seeding task types...");
  await seedTaskTypes(prisma);
  console.log("✅ Task types seeded\n");

  // Phase 3: Templates & Options
  console.log("🧠 Seeding reasoning templates...");
  await seedReasoningTemplates(prisma);
  console.log("✅ Reasoning templates seeded\n");

  console.log("📄 Seeding quick templates...");
  await seedQuickTemplates(prisma);
  console.log("✅ Quick templates seeded\n");

  console.log("🎨 Seeding select options...");
  await seedSelectOptions(prisma);
  console.log("✅ Select options seeded\n");

  console.log("🎉 Database seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
