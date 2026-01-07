import type { PrismaClient } from "../../src/generated/prisma/client";

// All select options organized by type
const selectOptionsData = {
  tone: [
    { value: "professional", label: "Professional" },
    { value: "casual", label: "Casual" },
    { value: "academic", label: "Academic" },
    { value: "creative", label: "Creative" },
    { value: "technical", label: "Technical" },
    { value: "friendly", label: "Friendly" },
    { value: "authoritative", label: "Authoritative" },
    { value: "empathetic", label: "Empathetic" },
    { value: "humorous", label: "Humorous" },
    { value: "formal", label: "Formal" },
    { value: "conversational", label: "Conversational" },
    { value: "inspirational", label: "Inspirational" }
  ],
  focus: [
    { value: "accuracy", label: "Accuracy" },
    { value: "creativity", label: "Creativity" },
    { value: "speed", label: "Speed" },
    { value: "detail", label: "Detail" },
    { value: "simplicity", label: "Simplicity" },
    { value: "depth", label: "Depth" },
    { value: "originality", label: "Originality" },
    { value: "practicality", label: "Practicality" },
    { value: "reliability", label: "Reliability" },
    { value: "exploration", label: "Exploration" },
    { value: "optimization", label: "Optimization" },
    { value: "multimodal", label: "Multimodal" },
    { value: "action_oriented", label: "Action-Oriented" },
    { value: "adaptability", label: "Adaptability" },
    { value: "comprehensiveness", label: "Comprehensiveness" },
    { value: "novelty", label: "Novelty" }
  ],
  constraint: [
    { value: "no_assumptions", label: "No assumptions" },
    { value: "be_concise", label: "Be concise" },
    { value: "cite_sources", label: "Cite sources" },
    { value: "use_examples", label: "Use examples" },
    { value: "be_formal", label: "Be formal" },
    { value: "step_by_step", label: "Step-by-step" },
    { value: "avoid_jargon", label: "Avoid jargon" },
    { value: "use_analogies", label: "Use analogies" },
    { value: "generate_multiple", label: "Generate multiple solutions" },
    { value: "compare_approaches", label: "Compare approaches" },
    { value: "select_consensus", label: "Select consensus" },
    { value: "explore_alternatives", label: "Explore alternatives" },
    { value: "evaluate_paths", label: "Evaluate paths" },
    { value: "backtrack_if_needed", label: "Backtrack if needed" },
    { value: "think_then_act", label: "Think then act" },
    { value: "observe_results", label: "Observe results" },
    { value: "iterate_until_solved", label: "Iterate until solved" },
    { value: "define_structure", label: "Define clear structure" },
    { value: "decompose_subtasks", label: "Decompose into subtasks" },
    { value: "synthesize_results", label: "Synthesize results" },
    { value: "consider_modalities", label: "Consider all modalities" },
    { value: "rationale_first", label: "Generate rationale first" },
    { value: "then_infer", label: "Then infer answer" },
    { value: "verify_external", label: "Verify with external sources" },
    { value: "cross_validate", label: "Cross-validate results" },
    { value: "document_reasoning", label: "Document reasoning" },
    { value: "explain_tradeoffs", label: "Explain trade-offs" }
  ],
  interest: [
    { value: "hobbyist", label: "Hobbyist", prefix: "From a hobbyist perspective, " },
    { value: "professional", label: "Professional", prefix: "From a professional perspective, " },
    { value: "academic", label: "Academic", prefix: "From an academic perspective, " },
    { value: "practical", label: "Practical", prefix: "From a practical implementation perspective, " },
    { value: "theoretical", label: "Theoretical", prefix: "From a theoretical standpoint, " },
    { value: "beginner", label: "Beginner", prefix: "Explained for a beginner, " },
    { value: "expert", label: "Expert", prefix: "For an expert audience, " }
  ],
  perspective: [
    { value: "neutral", label: "Neutral/Objective" },
    { value: "optimistic", label: "Optimistic" },
    { value: "critical", label: "Critical" },
    { value: "historical", label: "Historical" },
    { value: "futureOriented", label: "Future-Oriented" },
    { value: "comparative", label: "Comparative" },
    { value: "practical", label: "Practical/Applied" }
  ]
};

export async function seedSelectOptions(prisma: PrismaClient) {
  let total = 0;

  for (const [type, options] of Object.entries(selectOptionsData)) {
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      await prisma.selectOption.upsert({
        where: {
          type_value: { type, value: option.value },
        },
        update: {
          label: option.label,
          prefix: "prefix" in option ? option.prefix : null,
          sortOrder: i,
        },
        create: {
          type,
          value: option.value,
          label: option.label,
          prefix: "prefix" in option ? option.prefix : null,
          sortOrder: i,
        },
      });
      total++;
    }
  }

  console.log(`  - Upserted ${total} select options across ${Object.keys(selectOptionsData).length} types`);
}
