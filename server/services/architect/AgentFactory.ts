import { ChatOpenAI } from "@langchain/openai";
import { AgentPhase } from "./types";
import { RESEARCH_AGENT_PROMPT, PLANNING_AGENT_PROMPT, PHASING_AGENT_PROMPT, MASTER_CONTEXT_AGENT_PROMPT, EXECUTOR_AGENT_PROMPT, AUDITOR_AGENT_PROMPT, REVIEWER_AGENT_PROMPT } from "./prompts";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { PERSONAS, PersonaType } from "./personas";

export class AgentFactory {
  private llm: ChatOpenAI;

  constructor(apiKey: string) {
    this.llm = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o",
      temperature: 0.7, // Higher temp for creative sub-agents
    });
  }

  getAgentForPhase(phase: AgentPhase, personalityId: string = 'startup-cto') {
    const persona = PERSONAS[personalityId as PersonaType] || PERSONAS['startup-cto'];
    const personaInstruction = persona.systemInstruction;
    
    switch (phase) {
      case 'RESEARCH_VALIDATE':
        return this.createResearchAgent(personaInstruction);
      case 'PLAN_SRS':
        return this.createPlanningAgent(personaInstruction);
      case 'PHASING_ROADMAP':
        return this.createPhasingAgent(personaInstruction);
      case 'MASTER_CONTEXT':
        return this.createMasterContextAgent(personaInstruction);
      case 'EXECUTE_CODE':
        return this.createExecutorAgent(personaInstruction);
      case 'AUDIT_VERIFY':
        return this.createAuditorAgent(personaInstruction);
      case 'REVIEW_FINALIZE':
        return this.createReviewerAgent(personaInstruction);
      default:
        throw new Error(`No agent defined for phase: ${phase}`);
    }
  }

  private createResearchAgent(personaInstruction: string) {
    const schema = z.object({
        reasoning: z.string().describe("Explain your thought process step-by-step before generating the final JSON."),
        marketAnalysis: z.string().describe("A comprehensive analysis of the market viability and trends."),
        recommendedTechStack: z.object({
            frontend: z.string(),
            backend: z.string(),
            database: z.string(),
            infrastructure: z.string()
        }).describe("The recommended technology stack."),
        pros: z.array(z.string()).describe("Advantages of this approach"),
        cons: z.array(z.string()).describe("Disadvantages of this approach"),
        challenges: z.array(z.string()).describe("Technical challenges to anticipate")
    });

    return {
      name: 'Research Agent',
      execute: async (input: string) => {
        const structuredLLM = this.llm.withStructuredOutput(schema);
        const prompt = ChatPromptTemplate.fromMessages([
          ["system", personaInstruction + "\n\n" + RESEARCH_AGENT_PROMPT],
          ["user", input]
        ]);
        const chain = prompt.pipe(structuredLLM);
        return await chain.invoke({});
      }
    };
  }

  private createPlanningAgent(personaInstruction: string) {
    const schema = z.object({
        reasoning: z.string().describe("Explain your thought process step-by-step before generating the final JSON."),
        databaseSchema: z.string().describe("The prisma schema code block"),
        apiEndpoints: z.array(z.object({
            method: z.string(),
            path: z.string(),
            description: z.string()
        })).describe("List of API endpoints"),
        userStories: z.array(z.string()).describe("User stories and acceptance criteria"),
        architectureDiagram: z.string().optional().describe("Mermaid JS code for system architecture")
    });

     return {
      name: 'Planning Agent',
      execute: async (input: string) => {
        const structuredLLM = this.llm.withStructuredOutput(schema);
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", personaInstruction + "\n\n" + PLANNING_AGENT_PROMPT],
            ["user", input]
          ]);
          const chain = prompt.pipe(structuredLLM);
          return await chain.invoke({});
      }
    };
  }

  private createPhasingAgent(personaInstruction: string) {
    const schema = z.object({
        reasoning: z.string().describe("Explain your thought process step-by-step before generating the final JSON."),
        phases: z.array(z.object({
            id: z.string(),
            title: z.string(),
            description: z.string(),
            tasks: z.array(z.string())
        })),
        criticalPath: z.array(z.string()).describe("List of phase IDs that form the critical path"),
        estimatedDuration: z.string()
    });

    return {
      name: 'Phasing Agent',
      execute: async (input: string) => {
        const structuredLLM = this.llm.withStructuredOutput(schema);
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", personaInstruction + "\n\n" + PHASING_AGENT_PROMPT],
            ["user", input]
          ]);
          const chain = prompt.pipe(structuredLLM);
          return await chain.invoke({});
      }
    };
  }

  private createMasterContextAgent(personaInstruction: string) {
    const schema = z.object({
        reasoning: z.string().describe("Explain your thought process step-by-step before generating the final JSON."),
        fileContext: z.string().describe("The full markdown content of the master context file"),
        projectSummary: z.string().describe("High level executive summary"),
        nextSteps: z.array(z.string()).describe("Immediate next steps for the execution agent")
    });

    return {
      name: 'Master Context Agent',
      execute: async (input: string) => {
        const structuredLLM = this.llm.withStructuredOutput(schema);
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", personaInstruction + "\n\n" + MASTER_CONTEXT_AGENT_PROMPT],
            ["user", input]
          ]);
          const chain = prompt.pipe(structuredLLM);
          return await chain.invoke({});
      }
    };
  }

  private createExecutorAgent(personaInstruction: string) {
    const schema = z.object({
        reasoning: z.string().describe("Explain your thought process step-by-step before generating the prompt."),
        systemPrompt: z.string().describe("The detailed System Instruction for the agent"),
        userPromptTemplate: z.string().describe("The template for user interaction"),
        contextFiles: z.array(z.object({
            name: z.string().describe("Name of the context file"),
            content: z.string().describe("Content of the file"),
            description: z.string().describe("Why this file is relevant")
        })),
        exampleInteractions: z.array(z.object({
            user: z.string(),
            assistant: z.string()
        })).optional().describe("Few-shot examples for the prompt")
    });

    return {
      name: 'Executor Agent (Prompt Architect)',
      execute: async (input: string) => {
        const structuredLLM = this.llm.withStructuredOutput(schema);
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", personaInstruction + "\n\n" + EXECUTOR_AGENT_PROMPT],
            ["user", input]
          ]);
          const chain = prompt.pipe(structuredLLM);
          return await chain.invoke({});
      }
    };
  }

  private createAuditorAgent(personaInstruction: string) {
    const schema = z.object({
        reasoning: z.string().describe("Explain your thought process step-by-step before generating the final JSON."),
        score: z.number().describe("Prompt Quality score from 0 to 100"),
        issues: z.array(z.object({
            severity: z.enum(['critical', 'warning', 'info']),
            message: z.string(),
            suggestion: z.string()
        })),
        isApproved: z.boolean().describe("Whether the prompt is ready for use"),
        finalThoughts: z.string().describe("Final verdict summary")
    });

    return {
      name: 'Auditor Agent (Prompt Critic)',
      execute: async (input: string) => {
         const structuredLLM = this.llm.withStructuredOutput(schema);
         const prompt = ChatPromptTemplate.fromMessages([
            ["system", personaInstruction + "\n\n" + AUDITOR_AGENT_PROMPT],
            ["user", input]
          ]);
          const chain = prompt.pipe(structuredLLM);
          return await chain.invoke({});
      }
    };
  }

  private createReviewerAgent(personaInstruction: string) {
    const schema = z.object({
        reasoning: z.string().describe("Explain your thought process step-by-step before generating the final JSON."),
        reviewNotes: z.string().describe("Detailed notes from the senior engineer review"),
        signOff: z.boolean().describe("Whether the project is final and approved"),
        nextIterationSuggestions: z.array(z.string()).describe("Suggestions for V2 or improvements")
    });

    return {
      name: 'Reviewer Agent',
      execute: async (input: string) => {
         const structuredLLM = this.llm.withStructuredOutput(schema);
         const prompt = ChatPromptTemplate.fromMessages([
            ["system", personaInstruction + "\n\n" + REVIEWER_AGENT_PROMPT],
            ["user", input]
          ]);
          const chain = prompt.pipe(structuredLLM);
          return await chain.invoke({});
      }
    };
  }
}
