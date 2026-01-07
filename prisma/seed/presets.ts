import type { PrismaClient } from "../../src/generated/prisma/client";

const presetModesData = [
  {
    slug: "default",
    name: "🎯 Balanced Expert",
    description: "Well-rounded configuration for most tasks",
    config: {
      tier: "tier3",
      technique: "xml",
      roleAssignment: "highly knowledgeable expert assistant",
      tone: "professional",
      useXML: true,
      chainOfThought: false,
      verification: false,
      reasoningMode: false,
      personality: "none",
      iqLevel: "130",
      expertise: "expert",
      focusAreas: ["Accuracy", "Detail"],
      constraints: ["Use examples", "Step-by-step"]
    },
    isDefault: true,
    sortOrder: 0
  },
  {
    slug: "genius",
    name: "🧠 Genius Mode",
    description: "Maximum intelligence and reasoning depth",
    config: {
      tier: "tier5",
      technique: "verification",
      roleAssignment: "genius-level expert with exceptional analytical abilities",
      tone: "academic",
      useXML: true,
      chainOfThought: true,
      verification: true,
      reasoningMode: true,
      reasoningSteps: "analytical",
      personality: "none",
      iqLevel: "160",
      expertise: "world-class expert",
      focusAreas: ["Accuracy", "Depth", "Detail"],
      constraints: ["No assumptions", "Cite sources", "Step-by-step"]
    },
    sortOrder: 1
  },
  {
    slug: "creative",
    name: "✨ Creative Genius",
    description: "Maximum creativity and originality",
    config: {
      tier: "tier4",
      technique: "fewshot",
      roleAssignment: "creative visionary with exceptional imagination",
      tone: "creative",
      useXML: true,
      chainOfThought: true,
      reasoningMode: true,
      reasoningSteps: "creative",
      personality: "luna",
      iqLevel: "142",
      expertise: "creative expert",
      focusAreas: ["Creativity", "Originality"],
      constraints: ["Use examples", "Avoid jargon"]
    },
    sortOrder: 2
  },
  {
    slug: "technical",
    name: "💻 Technical Expert",
    description: "Deep technical analysis and problem-solving",
    config: {
      tier: "tier5",
      technique: "cot",
      roleAssignment: "senior technical expert",
      tone: "technical",
      useXML: true,
      chainOfThought: true,
      verification: true,
      personality: "drchen",
      iqLevel: "145",
      expertise: "technical specialist",
      focusAreas: ["Accuracy", "Detail", "Depth"],
      constraints: ["Step-by-step", "Use examples"]
    },
    sortOrder: 3
  },
  {
    slug: "teacher",
    name: "🎓 Master Teacher",
    description: "Explain complex topics simply and clearly",
    config: {
      tier: "tier3",
      technique: "cot",
      roleAssignment: "exceptional teacher with gift for explanation",
      tone: "friendly",
      useXML: true,
      chainOfThought: true,
      personality: "socrates",
      perspectiveMode: "beginner",
      iqLevel: "138",
      expertise: "teaching expert",
      focusAreas: ["Simplicity", "Practicality"],
      constraints: ["Avoid jargon", "Use analogies", "Use examples"]
    },
    sortOrder: 4
  },
  {
    slug: "self_consistent",
    name: "🔄 Self-Consistency Mode",
    description: "Generate multiple reasoning paths and select most consistent answer",
    config: {
      tier: "tier5",
      technique: "self_consistency",
      roleAssignment: "multi-perspective analytical expert",
      tone: "analytical",
      useXML: true,
      chainOfThought: true,
      selfConsistency: true,
      samplingPaths: 5,
      personality: "drvega",
      iqLevel: "149",
      expertise: "research methodologist",
      focusAreas: ["Accuracy", "Depth", "Reliability"],
      constraints: ["Generate multiple solutions", "Compare approaches", "Select consensus"],
      performanceGain: "+17% accuracy on arithmetic tasks"
    },
    sortOrder: 5
  },
  {
    slug: "tree_thoughts",
    name: "🌳 Tree of Thoughts",
    description: "Explore multiple reasoning branches with backtracking",
    config: {
      tier: "tier5",
      technique: "tot",
      roleAssignment: "strategic problem solver with branching logic",
      tone: "analytical",
      useXML: true,
      treeOfThoughts: true,
      explorationDepth: 3,
      branchingFactor: 3,
      personality: "drorion",
      iqLevel: "152",
      expertise: "systems theorist",
      focusAreas: ["Depth", "Exploration", "Optimization"],
      constraints: ["Explore alternatives", "Evaluate paths", "Backtrack if needed"],
      performanceGain: "+74% success rate vs 4% baseline"
    },
    sortOrder: 6
  },
  {
    slug: "react_agent",
    name: "⚡ ReAct Agent",
    description: "Reason and act iteratively with external feedback",
    config: {
      tier: "tier5",
      technique: "react",
      roleAssignment: "autonomous reasoning-acting agent",
      tone: "systematic",
      useXML: true,
      reactLoop: true,
      maxIterations: 10,
      personality: "drchen",
      iqLevel: "145",
      expertise: "systematic problem solver",
      focusAreas: ["Accuracy", "Adaptability", "Action-Oriented"],
      constraints: ["Think then act", "Observe results", "Iterate until solved"],
      performanceGain: "+8% accuracy on research tasks"
    },
    sortOrder: 7
  }
];

export async function seedPresetModes(prisma: PrismaClient) {
  let created = 0;
  let updated = 0;

  for (const preset of presetModesData) {
    const existing = await prisma.presetMode.findUnique({
      where: { slug: preset.slug },
    });

    if (existing) {
      await prisma.presetMode.update({
        where: { slug: preset.slug },
        data: preset,
      });
      updated++;
    } else {
      await prisma.presetMode.create({
        data: preset,
      });
      created++;
    }
  }

  console.log(`  - Created ${created} new preset modes`);
  console.log(`  - Updated ${updated} existing preset modes`);
}
