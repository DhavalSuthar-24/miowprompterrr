import { personalities, advancedTechniqueGuide } from "../../data/constants";
import { z } from "zod";
import { tool } from "@langchain/core/tools";

// 1. Tool to get detailed personality info
export const getPersonalityDetailsTool = tool(
  async ({ id }: { id: string }) => {
    const persona = personalities.find((p: any) => p.id === id || p.name.includes(id));
    if (!persona) return `Personality '${id}' not found.`;
    return JSON.stringify(persona, null, 2);
  },
  {
    name: "get_personality_details",
    description: "Get the full profile, rules, and example output for a specific personality ID (e.g., 'oracle', 'vision'). Use this to understand HOW a persona writes.",
    schema: z.object({
      id: z.string().describe("The ID of the personality to look up"),
    }),
  }
);

// 2. Tool to get detailed technique info
export const getTechniqueDetailsTool = tool(
  async ({ id }: { id: string }) => {
    // Search in advancedTechniqueGuide values
    const technique = Object.values(advancedTechniqueGuide).find((t: any) => t.id === id || t.name.includes(id));
    if (!technique) return `Technique '${id}' not found.`;
    return JSON.stringify(technique, null, 2);
  },
  {
    name: "get_technique_details",
    description: "Get the full guide, instructions, and best practices for a specific prompt engineering technique (e.g., 'react', 'tot').",
    schema: z.object({
      id: z.string().describe("The ID or name of the technique"),
    }),
  }
);
