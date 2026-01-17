import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { AgentExecutor, createOpenAIFunctionsAgent } from "langchain/agents";

// Tools
import { getPersonalityDetailsTool, getTechniqueDetailsTool } from "./tools/knowledgeTool";
import { createMemoryTool } from "./tools/memoryTool";
import { createCritiqueTool } from "./tools/critiqueTool";

// Constants
import { personalities } from "../data/constants";

// Helper to format knowledge for the LLM
const getFormattedPersonalities = () => {
    return personalities.map((p: any) => `- ${p.name}: ${p.desc}`).join("\n");
};





export const agentService = {
  async runAutonomousAgent(userPrompt: string, apiKey: string, userId: string, model: string = "gpt-4o") {
    // Input validation
    if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
      throw new Error("User prompt is required and must be a non-empty string");
    }
    
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      throw new Error("API key is required for the autonomous agent");
    }

    if (!userId) {
       throw new Error("User ID is required for memory context");
    }

    
    const sanitizedPrompt = userPrompt.trim().substring(0, 10000); // Limit prompt length
    const sanitizedModel = model?.trim() || "gpt-4o";
    
    try {
      // 0. Initialize Models & Tools
      const llm = new ChatOpenAI({
        openAIApiKey: apiKey,
        modelName: sanitizedModel,
        temperature: 0.7,
      });

      // Pass the LLM to the critique tool
      const critiqueTool = createCritiqueTool(llm);
      const searchMemory = createMemoryTool(userId);
      
      const tools = [
        getPersonalityDetailsTool,
        getTechniqueDetailsTool,
        searchMemory,
        critiqueTool
      ];

      // 2. Define the ReAct Agent Prompt
      const prompt = ChatPromptTemplate.fromMessages([
        ["system", `You are an Advanced Autonomous Prompt Engineer (Level 5).
        
        Your Goal: Construct the PERFECT System Prompt for the user's request.
        
        You have access to TOOLS to help you:
        - 'search_memory': CHECK THIS FIRST to see if the user has preferences.
        - 'get_personality_details': Research specific personas (e.g., 'oracle', 'vision') to get their exact 'rules'.
        - 'get_technique_details': Research techniques (e.g., 'tot', 'react').
        - 'critique_prompt_draft': Use this to iteratively improve your prompt.

        Available Profile Index (Use tool for details):
        ${getFormattedPersonalities()}
        
        Process:
        1. Search Memory for user preferences.
        2. Analyze the request. Select a Personality & Techniques.
        3. Research the details of that Personality/Technique if you aren't 100% sure of the exact 'rules' string.
        4. Draft the prompt.
        5. Critique it.
        6. OUTPUT the Final Result as JSON.

        IMPORTANT: Your Final Answer MUST be a valid JSON object matching this schema:
        {{
          "personality": "string",
          "techniques": ["string"],
          "reasoning": "string",
          "systemPrompt": "string (The final polished result)"
        }}
        Do NOT wrap the JSON in markdown code blocks. Just return the JSON string.
        `],
        ["human", "{input}"],
        ["placeholder", "{agent_scratchpad}"],
      ]);

      // 3. Create Agent
      const agent = await createOpenAIFunctionsAgent({
        llm,
        tools,
        prompt,
      });

      const executor = new AgentExecutor({
        agent,
        tools,
        verbose: true,
        returnIntermediateSteps: true,
        maxIterations: 10 // Prevent infinite loops
      });

      console.log("Starting ReAct Agent Loop...");
      const result = await executor.invoke({ input: sanitizedPrompt });
      
      console.log("Agent finished.");

      // 4. Parse Final Output with robust error handling
      let analysis;
      try {
        // Strip markdown if present
        const rawOutput = result.output || "";
        const jsonString = rawOutput.replace(/```json/g, "").replace(/```/g, "").trim();
        
        if (!jsonString) {
          throw new Error("Empty output from agent");
        }
        
        analysis = JSON.parse(jsonString);
        
        // Validate required fields
        if (!analysis.systemPrompt || typeof analysis.systemPrompt !== 'string') {
          analysis.systemPrompt = rawOutput.length > 50 ? rawOutput : "Failed to generate system prompt";
        }
        
      } catch (e) {
        console.warn("Failed to parse agent JSON:", e);
        // Fallback with useful information
        analysis = {
            personality: "Unknown",
            techniques: [],
            reasoning: "Agent failed to format JSON. The system attempted to extract useful output.",
            systemPrompt: result.output && result.output.length > 200 ? result.output : "Error: Unable to generate a valid prompt. Please try again with a clearer request."
        };
      }

      // 5. Structure for Frontend with null checks
      const steps = result.intermediateSteps ? result.intermediateSteps.map((step: any) => {
        return {
            action: step.action?.tool || "unknown",
            input: step.action?.toolInput ? JSON.stringify(step.action.toolInput) : "{}",
            observation: step.observation || "No observation"
        };
      }) : [];

      // 6. Run the optimized prompt to get final answer
      console.log("Running optimized prompt execution...");
      const resultPrompt = ChatPromptTemplate.fromMessages([
            ["system", analysis.systemPrompt || "You are a helpful assistant."],
            ["user", sanitizedPrompt]
      ]);
      const executionChain = resultPrompt.pipe(llm);
      
      let executionResult;
      try {
        executionResult = await executionChain.invoke({});
      } catch (execError: any) {
        console.error("Execution chain error:", execError);
        executionResult = { content: `Note: The system prompt was generated but execution failed: ${execError.message}. You can still use the generated system prompt.` };
      }

      return {
        status: "success",
        analysis: {
            ...analysis,
            memoriesUsed: steps.find((s:any) => s.action === 'search_memory')?.observation || "None",
            agentSteps: steps
        },
        response: executionResult.content || "No response generated"
      };

    } catch (error: any) {
      console.error("Agent Error:", error);
      
      // Provide helpful error messages for common issues
      let errorMessage = error.message || "Failed to run autonomous agent";
      
      if (errorMessage.includes("401") || errorMessage.includes("Unauthorized")) {
        errorMessage = "Invalid API key. Please check your OpenAI API key.";
      } else if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
        errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
      } else if (errorMessage.includes("insufficient_quota")) {
        errorMessage = "API quota exceeded. Please check your OpenAI billing.";
      }
      
      throw new Error(errorMessage);
    }
  }
};
