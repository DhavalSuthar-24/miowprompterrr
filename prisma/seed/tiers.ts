import type { PrismaClient } from "../../src/generated/prisma/client";

const tiersData = [
  {
    slug: "tier1",
    label: "Foundation",
    color: "bg-blue-100 border-blue-300",
    description: "Simple, direct communication",
    sortOrder: 1,
    techniques: [
      { slug: "basic", label: "📝 Direct Instructions", description: "Simple, clear communication" },
      { slug: "natural", label: "💬 Natural Language", description: "Conversational requests" }
    ]
  },
  {
    slug: "tier2",
    label: "Control",
    color: "bg-green-100 border-green-300",
    description: "Precision in responses",
    sortOrder: 2,
    techniques: [
      { slug: "role", label: "👤 Role Assignment", description: "Assign expert personas" },
      { slug: "format", label: "📐 Output Formatting", description: "Control response structure" },
      { slug: "length", label: "📏 Length Control", description: "Specify word count" },
      { slug: "language", label: "🌐 Language Control", description: "Set response language" }
    ]
  },
  {
    slug: "tier3",
    label: "Structure",
    color: "bg-purple-100 border-purple-300",
    description: "XML & templates",
    sortOrder: 3,
    techniques: [
      { slug: "xml", label: "🏷️ XML Tags", description: "Structure information" },
      { slug: "variables", label: "🔤 Variables/Templates", description: "Template-driven prompting" },
      { slug: "prefill", label: "✍️ Response Prefilling", description: "Guide response start" }
    ]
  },
  {
    slug: "tier4",
    label: "Learning",
    color: "bg-orange-100 border-orange-300",
    description: "Examples & reasoning",
    sortOrder: 4,
    techniques: [
      { slug: "fewshot", label: "📚 Few-Shot Learning", description: "2-3 examples provided" },
      { slug: "cot", label: "🧠 Chain-of-Thought", description: "Show reasoning steps" },
      { slug: "evidence", label: "📋 Evidence-Based", description: "Quote then answer" },
      { slug: "generated_knowledge", label: "💡 Generated Knowledge", description: "Generate facts first, then answer" }
    ]
  },
  {
    slug: "tier5",
    label: "Advanced",
    color: "bg-red-100 border-red-300",
    description: "Multi-path intelligent reasoning",
    sortOrder: 5,
    techniques: [
      { slug: "workflow", label: "🔄 Multi-Step Workflow", description: "Complex task chains" },
      { slug: "verification", label: "✓ Verification System", description: "Accuracy validation" },
      { slug: "tools", label: "🛠️ Tool Integration", description: "Structured functions" },
      { slug: "self_consistency", label: "🔄 Self-Consistency", description: "Multiple paths, consensus answer" },
      { slug: "tot", label: "🌳 Tree of Thoughts", description: "Branching exploration with backtracking" },
      { slug: "react", label: "⚡ ReAct", description: "Reasoning + Acting loop" },
      { slug: "meta", label: "🎯 Meta-Prompting", description: "Structure-focused optimization" },
      { slug: "multimodal_cot", label: "🎨 Multimodal CoT", description: "Text + vision reasoning" },
      { slug: "ape", label: "🤖 Auto Prompt Engineering", description: "AI generates optimal prompts" },
      { slug: "net", label: "🧠 NET Framework", description: "Intelligent technique combination" }
    ]
  }
];

export async function seedTiers(prisma: PrismaClient) {
  let tiersCreated = 0;
  let techniquesCreated = 0;

  for (const tierData of tiersData) {
    const { techniques, ...tierInfo } = tierData;

    // Upsert tier
    const tier = await prisma.tier.upsert({
      where: { slug: tierInfo.slug },
      update: {
        label: tierInfo.label,
        color: tierInfo.color,
        description: tierInfo.description,
        sortOrder: tierInfo.sortOrder,
      },
      create: tierInfo,
    });

    tiersCreated++;

    // Upsert techniques for this tier
    for (let i = 0; i < techniques.length; i++) {
      const technique = techniques[i];
      await prisma.technique.upsert({
        where: { slug: technique.slug },
        update: {
          label: technique.label,
          description: technique.description,
          tierId: tier.id,
          sortOrder: i,
        },
        create: {
          slug: technique.slug,
          label: technique.label,
          description: technique.description,
          tierId: tier.id,
          sortOrder: i,
        },
      });
      techniquesCreated++;
    }
  }

  console.log(`  - Upserted ${tiersCreated} tiers`);
  console.log(`  - Upserted ${techniquesCreated} techniques`);
}
