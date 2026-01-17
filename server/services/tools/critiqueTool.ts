import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// Factory to create a critique tool bound to an LLM
export const createCritiqueTool = (llm: ChatOpenAI) => {
  return tool(
    async ({ draftPrompt, criteria }: { draftPrompt: string, criteria?: string }) => {
      const critiquePrompt = ChatPromptTemplate.fromMessages([
        ["system", `You are a strict Prompt Engineering Critic. Analyze the incoming System Prompt draft.
        
        Refinement Criteria:
        ${criteria || "- Is it clear and specific?\n- Does it use the requested personality?\n- Are constraints defined?\n- Is it too verbose?"}
        
        Return a concise critique. Point out 2-3 specific flaws or confirm it is perfect.
        If perfect, just say "Approved".`],
        ["user", draftPrompt]
      ]);

      const chain = critiquePrompt.pipe(llm).pipe(new StringOutputParser());
      return await chain.invoke({});
    },
    {
      name: "critique_prompt_draft",
      description: "Ask a Critic Agent to review your draft System Prompt. Returns specific feedback or approval.",
      schema: z.object({
        draftPrompt: z.string().describe("The draft system prompt to evaluate"),
        criteria: z.string().optional().describe("Optional specific criteria to check against")
      }),
    }
  );
};
