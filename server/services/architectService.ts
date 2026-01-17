
// System Prompts for the "Architect Agent"
const META_SYSTEM_PROMPT = `
You are a World-Class Software Architect and Prompt Engineer.
Your goal is to construct the MOST EFFECTIVE system prompts for an LLM to execute a specific phase of software development.

**CRITICAL STRATEGY: POLY-PROMPTING**
Use a "Chain of Prompts" approach. Instead of one giant prompt, break complex tasks into a sequence:
1. **PLAN**: Ask the LLM to think, plan, and write pseudo-code.
2. **EXECUTE**: Ask the LLM to write the actual code based on the plan.
3. **VALIDATE**: Ask the LLM to critique the code for "Hallucinations", "Security Risks", and "Best Practices".
4. **REPAIR**: (Optional) Ask the LLM to fix the code using the errors found in the Validation step.

**Output Format**:
Return specific JSON ONLY.
{
  "prompts": [
    {
      "label": "1. PLAN & THINK",
      "content": "..."
    },
    {
      "label": "2. EXECUTE CODE",
      "content": "..."
    },
    {
      "label": "3. VALIDATE & AUDIT",
      "content": "..."
    },
    {
      "label": "4. AUTO-REPAIR",
      "content": "..."
    }
  ]
}

If the phase is simple (like "Research"), you may return just one prompt in the array.
`.trim();

export const architectService = {
  async generatePrompt(step: string, context: any, apiKey: string, model: string = "gpt-4o"): Promise<{ prompts: { label: string, content: string }[] }> {
    // Input validation
    if (!step || typeof step !== 'string') {
      throw new Error("Invalid step: must be a non-empty string");
    }
    
    const validSteps = ['research', 'srs', 'todo', 'master', 'execution', 'audit'];
    const normalizedStep = step.toLowerCase().trim();
    
    // Log warning for unknown steps but don't block (allows flexibility)
    if (!validSteps.includes(normalizedStep)) {
      console.warn(`[Architect Service] Unknown step "${normalizedStep}", using fallback handler`);
    }
    
    if (!context || typeof context !== 'object') {
      throw new Error("Invalid context: must be an object");
    }

    try {
        const finalApiKey = apiKey || process.env.OPENAI_API_KEY;
        
        if (!finalApiKey) {
            throw new Error("API Key not found. Please set OPENAI_API_KEY env or provide it in the request.");
        }

      // 1. Construct the Input for the Architect Agent
      let userContextDesc = "";
      if (normalizedStep === 'research') {
        const idea = context.idea || "No idea provided";
        userContextDesc = `Phase: RESEARCH & VALIDATION\nUser Idea: "${idea}"\nGoal: Generate a prompt chain.\n1. "Deep Research": Competitors, Market Analysis, Tech Stack.\n2. "Critique": Act as a VC. Find holes in the research and specific risks.`;
      } else if (normalizedStep === 'srs') {
        const idea = context.idea || "No idea provided";
        const research = context.research ? context.research.substring(0, 1000) : "No research context";
        userContextDesc = `Phase: SRS & PLANNING\nUser Idea: "${idea}"\nResearch Context: "${research}..."\nGoal: Generate prompt chain.\n1. "SRS Draft": User Stories, Database Schema, API List.\n2. "SRS Audit": Act as a Database Architect. Critique schema normalization and missing API endpoints.`;
      } else if (normalizedStep === 'todo') {
        const srs = context.srs ? context.srs.substring(0, 1500) : "No SRS context";
        userContextDesc = `Phase: TASK BREAKDOWN\nSRS Context: "${srs}..."\nGoal: Generate prompt chain.\n1. "Breakdown": Convert SRS into phased JSON implementation plan.\n2. "Coverage Check": Verify that every User Story in the SRS is covered by a task in the breakdown.`;
      } else if (normalizedStep === 'master') {
         userContextDesc = `Phase: MASTER CONTEXT\nFull Context provided. Goal: Generate prompt chain.\n1. "God Prompt": The master prompt with all rules/context.\n2. "Context Validator": Check if the God Prompt is too long or missing critical auth/db rules.`;
      } else if (normalizedStep === 'execution') {
         const taskName = context.taskName || "Unnamed Task";
         const masterPrompt = context.masterPrompt ? context.masterPrompt.substring(0, 2000) : "No master context";
         userContextDesc = `Phase: EXECUTION\nTask: "${taskName}"\nContext: "${masterPrompt}..."\nGoal: Create a rigid 4-step chain (Plan -> Code -> Validate -> Repair) for this specific task. The Repair prompt must accept 'Original Code' and 'Validation Errors' as inputs.`;
      } else {
        // Fallback for unknown steps
        userContextDesc = `Phase: ${step}\nContext: ${JSON.stringify(context).substring(0, 2000)}`;
      }

      console.log(`[Architect Service] Sending to OpenAI (${model}) for step: ${normalizedStep}...`);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${finalApiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: META_SYSTEM_PROMPT },
            { role: "user", content: userContextDesc }
          ],
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        let errMessage = response.statusText;
        try {
          const errData: any = await response.json();
          errMessage = errData?.error?.message || response.statusText;
        } catch {
          // Couldn't parse error JSON, use statusText
        }
        throw new Error(`OpenAI API Error (${response.status}): ${errMessage}`);
      }

      const data: any = await response.json();
      
      // Validate response structure
      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        throw new Error("OpenAI returned an empty or invalid response");
      }
      
      const content = data.choices[0]?.message?.content || "{}";
      
      let parsed;
      try {
          parsed = JSON.parse(content);
      } catch (e) {
          // Fallback if JSON fails - wrap raw content in a prompt
          console.warn("[Architect Service] Failed to parse JSON, using raw content as fallback");
          parsed = { prompts: [{ label: "Generated Prompt", content: content }] };
      }

      // Validate parsed structure
      if (!parsed.prompts || !Array.isArray(parsed.prompts)) {
        // If AI returned something without prompts array, wrap it
        parsed = { prompts: [{ label: "Generated Prompt", content: JSON.stringify(parsed) }] };
      }
      
      // Ensure each prompt has label and content
      parsed.prompts = parsed.prompts.map((p: any, i: number) => ({
        label: p.label || `Step ${i + 1}`,
        content: p.content || (typeof p === 'string' ? p : JSON.stringify(p))
      }));
      
      // Ensure at least one prompt exists
      if (parsed.prompts.length === 0) {
        parsed.prompts = [{ label: "Generated Prompt", content: "No prompt was generated. Please try again." }];
      }

      return parsed;

    } catch (error: any) {
      console.error("Architect Service Error:", error);
      // Return a useful error prompt instead of throwing
      return {
        prompts: [{
          label: "Error",
          content: `Failed to generate AI prompt: ${error.message}\n\nPlease check:\n1. Your API key is valid\n2. You have API credits remaining\n3. The request context is not too large`
        }]
      };
    }
  }
};
