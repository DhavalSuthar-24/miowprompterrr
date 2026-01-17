import { ChatOpenAI } from "@langchain/openai";
import { AgentState, AgentResponse } from "./types";
import { AgentFactory } from "./AgentFactory";

export class ArchitectOrchestrator {
  private state: AgentState;
  private llm: ChatOpenAI;

  constructor(apiKey: string, initialState?: Partial<AgentState>) {
    this.llm = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4o",
      temperature: 0.2, // Low temp for orchestration precision
    });

    this.state = {
      sessionId: initialState?.sessionId || crypto.randomUUID(),
      currentPhase: initialState?.currentPhase || 'RESEARCH_VALIDATE',
      projectDescription: initialState?.projectDescription || '',
      techStack: initialState?.techStack || [],
      requirements: initialState?.requirements || [],
      phases: initialState?.phases || [],
      artifacts: initialState?.artifacts || {},
      memory: initialState?.memory || [],
      personality: initialState?.personality || 'startup-cto'
    };
  }

  /**
   * Main entry point to process a user prompt within the architect flow
   */
  async processPrompt(prompt: string): Promise<AgentResponse> {
    const startTime = Date.now();
    // 1. Update Memory
    this.addToMemory('user', prompt);

    console.log(`[Architect] Processing prompt in phase: ${this.state.currentPhase}`);

    // 2. Dispatch to appropriate sub-agent based on phase
    let response: AgentResponse;
    try {
      switch (this.state.currentPhase) {
        case 'RESEARCH_VALIDATE':
          response = await this.runResearchAgent(prompt);
          break;
        case 'PLAN_SRS':
          response = await this.runPlanningAgent(prompt);
          break;
        case 'PHASING_ROADMAP':
          response = await this.runPhasingAgent(prompt);
          break;
        case 'MASTER_CONTEXT':
          response = await this.runMasterContextAgent(prompt);
          break;
        case 'EXECUTE_CODE':
          response = await this.runExecutorAgent(prompt);
          break;
        case 'AUDIT_VERIFY':
          response = await this.runAuditorAgent(prompt);
          break;
        case 'REVIEW_FINALIZE':
          response = await this.runReviewerAgent(prompt);
          break;

        default:
          response = {
            success: false,
            message: `Phase ${this.state.currentPhase} not yet implemented.`
          };
      }
    } catch (error: any) {
      console.error("[Architect] Error processing prompt:", error);
      response = {
        success: false,
        message: `An error occurred: ${error.message}`
      };
    }

    // 3. Update Memory with response & Analytics
    if (response.success) {
        this.addToMemory('assistant', response.message);
        
        // Phase 11: Analytics Hook
        const latency = Date.now() - startTime;
        response.analytics = {
            latencyMs: latency,
            tokenUsage: this.estimateTokens(prompt + (response.message || "")) // Rough estimate
        };
    }

    return response;
  }
  
  /**
   * Simple tokenizer estimate
   */
  private estimateTokens(text: string): number {
     return Math.ceil((text || "").length / 4);
  }

  // --- Sub-Agent Execution ---

  private async runResearchAgent(prompt: string): Promise<AgentResponse> {
    const factory = new AgentFactory(this.llm.apiKey as string);
    const agent = factory.getAgentForPhase('RESEARCH_VALIDATE', this.state.personality);
    
    console.log("[Architect] Delegating to Research Agent...");
    const result = await agent.execute(prompt);
    
    // Store artifact in state
    this.state.artifacts['research'] = result;
    this.state.techStack = result.recommendedTechStack ? Object.values(result.recommendedTechStack) : [];

    return {
        success: true,
        message: "Research completed. Tech stack selected: " + JSON.stringify(result.recommendedTechStack),
        data: result,
        nextPhase: 'PLAN_SRS' 
    };
  }

  private async runPlanningAgent(prompt: string): Promise<AgentResponse> {
    const factory = new AgentFactory(this.llm.apiKey as string);
    const agent = factory.getAgentForPhase('PLAN_SRS', this.state.personality);

    // Munge context from previous phases
    const researchContext = this.state.artifacts['research'];
    const enrichedPrompt = `
      Context from Research Phase:
      ${this.truncateContext(JSON.stringify(researchContext, null, 2))}
      
      User Request: ${prompt}
    `;

    console.log("[Architect] Delegating to Planning Agent...");
    const result = await agent.execute(enrichedPrompt);
    
    // Store artifact
    this.state.artifacts['plan'] = result;

    return {
        success: true,
        message: "Planning completed. Database schema and API endpoints generated.",
        data: result,
        nextPhase: 'PHASING_ROADMAP'
    };
  }

  private async runPhasingAgent(prompt: string): Promise<AgentResponse> {
    const factory = new AgentFactory(this.llm.apiKey as string);
    const agent = factory.getAgentForPhase('PHASING_ROADMAP', this.state.personality);

    // Munge context from previous phases
    const planContext = this.state.artifacts['plan'];
    const enrichedPrompt = `
      Context from Planning Phase:
      ${this.truncateContext(JSON.stringify(planContext, null, 2))}
      
      User Request: ${prompt}
    `;

    console.log("[Architect] Delegating to Phasing Agent...");
    const result = await agent.execute(enrichedPrompt);
    
    // Store artifact
    this.state.artifacts['phasing'] = result;

    return {
        success: true,
        message: "Phasing completed. Project roadmap created.",
        data: result,
        nextPhase: 'MASTER_CONTEXT'
    };
  }

  private async runMasterContextAgent(prompt: string): Promise<AgentResponse> {
    const factory = new AgentFactory(this.llm.apiKey as string);
    const agent = factory.getAgentForPhase('MASTER_CONTEXT', this.state.personality);

    // Munge context from previous phases
    const research = this.state.artifacts['research'];
    const plan = this.state.artifacts['plan'];
    const phasing = this.state.artifacts['phasing'];
    
    const enrichedPrompt = `
      SYNTHESIS REQUEST:
      Identify the core requirements and create a Master Context file.

      ARTIFACTS:
      1. RESEARCH: ${this.truncateContext(JSON.stringify(research))}
      2. PLAN: ${this.truncateContext(JSON.stringify(plan))}
      3. PHASING: ${this.truncateContext(JSON.stringify(phasing))}
      
      User Request: ${prompt}
    `;

    console.log("[Architect] Delegating to Master Context Agent...");
    const result = await agent.execute(enrichedPrompt);
    
    // Store artifact
    this.state.artifacts['masterContext'] = result;

    return {
        success: true,
        message: "Master Context Generated. Ready for Execution.",
        data: result,
        nextPhase: 'EXECUTE_CODE'
    };
  }

  private async runExecutorAgent(prompt: string): Promise<AgentResponse> {
    const factory = new AgentFactory(this.llm.apiKey as string);
    const agent = factory.getAgentForPhase('EXECUTE_CODE', this.state.personality);

    // Munge context from previous phases
    const masterContext = this.state.artifacts['masterContext'];
    
    if (!masterContext || !masterContext.fileContext) {
        return { success: false, message: "Missing Master Context. Cannot Execute." };
    }

    const enrichedPrompt = `
      CONTEXT:
      ${this.truncateContext(masterContext.fileContext)}
      
      User Request: ${prompt}
    `;

    console.log("[Architect] Delegating to Executor Agent...");
    const result = await agent.execute(enrichedPrompt);
    
    // Store artifact
    this.state.artifacts['execution'] = result;

    return {
        success: true,
        message: "Execution Completed. Code generated.",
        data: result,
        nextPhase: 'AUDIT_VERIFY'
    };
  }

  private async runAuditorAgent(prompt: string): Promise<AgentResponse> {
    const factory = new AgentFactory(this.llm.apiKey as string);
    const agent = factory.getAgentForPhase('AUDIT_VERIFY', this.state.personality);

    const execution = this.state.artifacts['execution'];
    const masterContext = this.state.artifacts['masterContext'];

    if (!execution) {
        return { success: false, message: "No execution artifacts found to audit." };
    }

    const enrichedPrompt = `
      AUDIT REQUEST:
      Verify the generated code against the master context.

      MASTER CONTEXT:
      ${this.truncateContext(masterContext?.fileContext)}

      GENERATED CODE:
      ${JSON.stringify(execution, null, 2)}
      
      User Specific Concerns: ${prompt}
    `;

    console.log("[Architect] Delegating to Auditor Agent...");
    const result = await agent.execute(enrichedPrompt);
    
    // Store artifact
    this.state.artifacts['audit'] = result;

    if (result.isApproved) {
        return {
            success: true,
            message: "Audit Passed! Ready for Deployment.",
            data: result,
            nextPhase: 'REVIEW_FINALIZE'
        };
    } else {
         return {
            success: true, 
            message: "Audit Failed. Issues found: " + result.issues.length,
            data: result,
            nextPhase: 'EXECUTE_CODE' 
        };
    }
  }

  private async runReviewerAgent(prompt: string): Promise<AgentResponse> {
    const factory = new AgentFactory(this.llm.apiKey as string);
    const agent = factory.getAgentForPhase('REVIEW_FINALIZE', this.state.personality);

    const audit = this.state.artifacts['audit'];
    const masterContext = this.state.artifacts['masterContext'];

    const enrichedPrompt = `
      REVIEW REQUEST:
      Perform final sign-off.

      Audit Result: ${this.truncateContext(JSON.stringify(audit))}
      Project Goal: ${masterContext?.projectSummary}
      
      User Comments: ${prompt}
    `;

    console.log("[Architect] Delegating to Reviewer Agent...");
    const result = await agent.execute(enrichedPrompt);
    
    this.state.artifacts['review'] = result;

    if (result.signOff) {
         return {
            success: true,
            message: "PROJECT COMPLETE. Reviewer Approved.",
            data: result,
            nextPhase: undefined // End of flow
        };
    } else {
        return {
            success: true,
            message: "Reviewer Requesting Changes.",
            data: result,
            nextPhase: 'PLAN_SRS' // Loop back to planning? or Execution?
        };
    }
  }

  // --- Helpers ---

  private addToMemory(role: 'user' | 'assistant' | 'system', content: string) {
    this.state.memory.push({
      role,
      content,
      timestamp: Date.now()
    });
    
    // Memory Optimization: Prune if too large
    if (this.state.memory.length > 50) {
        this.pruneMemory();
    }
  }

  private pruneMemory() {
      // Keep first message (context start) and last 40
      const first = this.state.memory[0];
      const recent = this.state.memory.slice(-40);
      this.state.memory = [first, ...recent];
      console.log("[Architect] Memory pruned to keep context window manageable.");
  }

  /*
   * Helper to truncate large context strings for LLM safety
   */
  private truncateContext(content: string, maxLength: number = 8000): string {
      if (!content) return "";
      if (content.length <= maxLength) return content;
      return content.substring(0, maxLength) + "\n...[TRUNCATED FOR CONTEXT LIMIT]...";
  }

  public getState(): AgentState {
    return this.state;
  }
}
