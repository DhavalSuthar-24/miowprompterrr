import type { PrismaClient } from "../../src/generated/prisma/client";

const taskTypesData = [
  { value: "general", label: "🎯 General Task", rolePreset: "expert assistant" },
  { value: "qa", label: "❓ Question Answering", rolePreset: "knowledgeable expert" },
  { value: "classification", label: "📋 Classification", rolePreset: "classification specialist" },
  { value: "creative", label: "✨ Creative Writing", rolePreset: "creative expert and storyteller" },
  { value: "analysis", label: "🔍 Analysis", rolePreset: "analytical researcher" },
  { value: "coding", label: "💻 Coding", rolePreset: "senior software engineer" },
  { value: "extraction", label: "📄 Extraction", rolePreset: "data extraction specialist" },
  { value: "tutoring", label: "🎓 Tutoring", rolePreset: "Socratic tutor" },
  { value: "summarization", label: "📝 Summarization", rolePreset: "expert summarizer" },
  { value: "translation", label: "🌐 Translation", rolePreset: "professional translator" },
  { value: "brainstorm", label: "💡 Brainstorming", rolePreset: "creative strategist" },
  { value: "debugging", label: "🐛 Debugging", rolePreset: "expert debugger" },
  { value: "research", label: "🔬 Research & Synthesis", rolePreset: "research methodologist" },
  { value: "multimodal", label: "🎨 Multimodal Reasoning", rolePreset: "multimodal reasoning expert" },
  { value: "planning", label: "🗺️ Planning & Strategy", rolePreset: "strategic planner" },
  { value: "optimization", label: "⚙️ Optimization", rolePreset: "optimization specialist" }
];

export async function seedTaskTypes(prisma: PrismaClient) {
  let created = 0;
  let updated = 0;

  for (let i = 0; i < taskTypesData.length; i++) {
    const taskType = taskTypesData[i];
    const existing = await prisma.taskType.findUnique({
      where: { value: taskType.value },
    });

    if (existing) {
      await prisma.taskType.update({
        where: { value: taskType.value },
        data: { ...taskType, sortOrder: i },
      });
      updated++;
    } else {
      await prisma.taskType.create({
        data: { ...taskType, sortOrder: i },
      });
      created++;
    }
  }

  console.log(`  - Created ${created} new task types`);
  console.log(`  - Updated ${updated} existing task types`);
}
