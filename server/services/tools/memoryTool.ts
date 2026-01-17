import { Memory } from "mem0ai/oss";
import { z } from "zod";
import { tool } from "@langchain/core/tools";

const memory = new Memory();

export const createMemoryTool = (userId: string) => tool(
  async ({ query }: { query: string }) => {
    try {
      const searchResults: any = await memory.search(query, { userId, limit: 5 });
      const memories = Array.isArray(searchResults) ? searchResults : (searchResults?.results || []);
      
      if (!memories || memories.length === 0) return "No relevant memories found.";
      
      return memories.map((m: any) => `- ${m.memory}`).join("\n");
    } catch (error: any) {
      return `Error searching memory: ${error.message}`;
    }
  },
  {
    name: "search_memory",
    description: "Search the user's long-term memory for preferences, past projects, or specific instructions they've given before.",
    schema: z.object({
      query: z.string().describe("The search query to find relevant memories"),
    }) as any, // Cast to any to bypass strict Zod inference issues in this context
  }
);
