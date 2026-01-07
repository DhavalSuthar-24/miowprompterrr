import type { PrismaClient } from "../../src/generated/prisma/client";

const quickTemplatesData = [
  { name: "Basic Questioner", template: "Generate 10 thought-provoking questions about [TOPIC] that help explore different angles and implications.", category: "Structure" },
  { name: "STAR Framework", template: "Using the STAR framework (Situation, Task, Action, Result), analyze [SITUATION/TOPIC] and provide structured insights.", category: "Structure" },
  { name: "Five Whys", template: "Apply the Five Whys technique to analyze [PROBLEM]: ask 'why' five times to find the root cause, then propose solutions.", category: "Analysis" },
  { name: "Mind Map", template: "Create a comprehensive mind map for [TOPIC] with main branches for different aspects, sub-branches for details.", category: "Structure" },
  { name: "Pros/Cons Analysis", template: "Provide a detailed pros and cons analysis of [TOPIC/DECISION], considering short-term and long-term implications.", category: "Analysis" },
  { name: "SWOT Analysis", template: "Conduct a SWOT analysis of [TOPIC/ORGANIZATION]: identify internal Strengths and Weaknesses, and external Opportunities and Threats.", category: "Analysis" },
  { name: "Expert Panel", template: "Simulate a discussion among 3-5 experts with different perspectives on [TOPIC]. Each should present their unique viewpoint.", category: "Ideation" },
  { name: "First Principles", template: "Break down [TOPIC/PROBLEM] to its most fundamental truths and reason up from there to create novel solutions.", category: "Analysis" },
  { name: "Feynman Technique", template: "Explain [CONCEPT] as if teaching it to a 5-year-old. Use simple language, analogies, and identify any gaps in understanding.", category: "Teaching" },
  { name: "Six Thinking Hats", template: "Apply the Six Thinking Hats method to [TOPIC]: analyze from factual, emotional, cautious, optimistic, creative, and procedural perspectives.", category: "Analysis" },
  { name: "Devil's Advocate", template: "Take the opposite position on [VIEWPOINT/ARGUMENT] and construct the strongest possible counterargument.", category: "Refinement" },
  { name: "SCAMPER Innovation", template: "Apply SCAMPER to [PRODUCT/IDEA]: Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse.", category: "Ideation" },
  { name: "Roaster Challenge", template: "You are a brutally honest learning coach with a sharp tongue. I want to learn [TOPIC]. First, roast my current understanding by asking me 3 tough questions about the basics.", category: "Learning" },
  { name: "Problem → Solution → Practice", template: "Teach me [TOPIC] using a problem-based approach. For each key concept: 1. Present a realistic problem. 2. Explain the concept as the solution. 3. Give a step-by-step method.", category: "Learning" },
  { name: "Teach + Quiz + Reflect", template: "Act as my personal tutor for [TOPIC]. 1. Teach the concept in 3-5 clear points. 2. Give me a 3-question quiz. 3. Provide the answers with detailed reasoning.", category: "Learning" },
  { name: "First Principles Explainer", template: "Explain [CONCEPT/TOPIC] using first principles thinking. Start by explaining the PROBLEMS we faced BEFORE this concept existed, then introduce the concept as the solution.", category: "Learning" },
  { name: "Self-Consistency Multi-Path", template: "Solve [PROBLEM] using three completely different approaches. For each approach: 1. Name the method. 2. Show the step-by-step reasoning. 3. Arrive at an answer.", category: "Advanced Reasoning" },
  { name: "Tree of Thoughts Explorer", template: "For [PROBLEM], explore multiple solution paths like a decision tree. Generate 3 possible first steps, score them, and pursue the most promising branch.", category: "Advanced Reasoning" },
  { name: "ReAct Loop Agent", template: "Act as an autonomous problem-solving agent for [TASK]. Follow this loop: THOUGHT → ACTION → OBSERVATION. Repeat until you have enough information.", category: "Advanced Reasoning" },
  { name: "Meta-Prompt Optimizer", template: "Before solving [PROBLEM], first analyze what type of problem this is and what solving structure would work best. Then apply your optimized structure.", category: "Advanced Reasoning" }
];

export async function seedQuickTemplates(prisma: PrismaClient) {
  let created = 0;
  let updated = 0;

  for (let i = 0; i < quickTemplatesData.length; i++) {
    const template = quickTemplatesData[i];
    const existing = await prisma.quickTemplate.findFirst({
      where: { name: template.name },
    });

    if (existing) {
      await prisma.quickTemplate.update({
        where: { id: existing.id },
        data: { ...template, sortOrder: i },
      });
      updated++;
    } else {
      await prisma.quickTemplate.create({
        data: { ...template, sortOrder: i },
      });
      created++;
    }
  }

  console.log(`  - Created ${created} new quick templates`);
  console.log(`  - Updated ${updated} existing quick templates`);
}
