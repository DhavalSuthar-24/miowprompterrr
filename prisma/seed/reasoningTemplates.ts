import type { PrismaClient } from "../../src/generated/prisma/client";

const reasoningTemplatesData = [
  {
    slug: "standard",
    name: "Standard Reasoning",
    steps: [
      "Identify the key components of the question",
      "Analyze and break down what is being asked",
      "Apply relevant knowledge and reasoning",
      "Verify your conclusion for accuracy",
      "Present your answer in a clear, structured format"
    ]
  },
  {
    slug: "creative",
    name: "Creative Exploration",
    steps: [
      "Explore multiple interpretations of the prompt",
      "Brainstorm diverse perspectives and ideas",
      "Identify unconventional connections",
      "Develop and refine the most promising concept",
      "Present creative solutions with imaginative flair"
    ]
  },
  {
    slug: "analytical",
    name: "Analytical Deep Dive",
    steps: [
      "Identify the core problem or question",
      "Break down into component parts",
      "Gather and evaluate relevant evidence",
      "Apply systematic analytical frameworks",
      "Synthesize findings into coherent insights"
    ]
  },
  {
    slug: "problemSolving",
    name: "Problem Solving Framework",
    steps: [
      "Clearly define the problem and desired outcome",
      "Identify constraints and requirements",
      "Generate potential solutions",
      "Evaluate each solution against criteria",
      "Select and implement the best solution"
    ]
  },
  {
    slug: "selfConsistency",
    name: "Self-Consistency (Multi-Path)",
    steps: [
      "Generate 3-5 independent reasoning paths",
      "Follow each path to a conclusion",
      "Compare all conclusions",
      "Identify the consensus answer",
      "Explain why this answer is most reliable"
    ]
  },
  {
    slug: "treeOfThoughts",
    name: "Tree of Thoughts Exploration",
    steps: [
      "Generate 3 possible first steps",
      "Evaluate each step with a 1-10 score",
      "Pursue the most promising branch",
      "If stuck, backtrack and explore alternatives",
      "Continue until optimal solution found"
    ]
  },
  {
    slug: "react",
    name: "ReAct Reasoning-Acting Loop",
    steps: [
      "THOUGHT: What do I need to know or do?",
      "ACTION: Describe the action to take",
      "OBSERVATION: What did I learn?",
      "Repeat until problem is solved",
      "Present final answer with full reasoning trace"
    ]
  },
  {
    slug: "metaPrompting",
    name: "Meta-Prompting Structure",
    steps: [
      "Analyze problem type and complexity",
      "Determine optimal technique combination",
      "Decompose into structured subtasks",
      "Execute with appropriate expert delegation",
      "Synthesize results into coherent output"
    ]
  },
  {
    slug: "multimodalCoT",
    name: "Multimodal Chain-of-Thought",
    steps: [
      "Analyze all text components",
      "Analyze all visual components",
      "Identify connections between modalities",
      "Generate integrated rationale",
      "Infer final answer using combined evidence"
    ]
  },
  {
    slug: "generatedKnowledge",
    name: "Generated Knowledge Prompting",
    steps: [
      "Generate 5-7 relevant facts and context",
      "Identify which facts are most applicable",
      "Build answer using generated knowledge",
      "Cross-validate against known information",
      "Present answer with supporting knowledge base"
    ]
  }
];

export async function seedReasoningTemplates(prisma: PrismaClient) {
  let created = 0;
  let updated = 0;

  for (let i = 0; i < reasoningTemplatesData.length; i++) {
    const template = reasoningTemplatesData[i];
    const existing = await prisma.reasoningTemplate.findUnique({
      where: { slug: template.slug },
    });

    if (existing) {
      await prisma.reasoningTemplate.update({
        where: { slug: template.slug },
        data: { ...template, sortOrder: i },
      });
      updated++;
    } else {
      await prisma.reasoningTemplate.create({
        data: { ...template, sortOrder: i },
      });
      created++;
    }
  }

  console.log(`  - Created ${created} new reasoning templates`);
  console.log(`  - Updated ${updated} existing reasoning templates`);
}
