export type AgentPhase = 
  | 'RESEARCH_VALIDATE'
  | 'PLAN_SRS'
  | 'PHASING_ROADMAP'
  | 'MASTER_CONTEXT'
  | 'EXECUTE_CODE'
  | 'AUDIT_VERIFY'
  | 'REVIEW_FINALIZE';

export interface AgentState {
  sessionId: string;
  currentPhase: AgentPhase;
  projectDescription: string;
  techStack: string[];
  requirements: string[];
  phases: ProjectPhase[];
  artifacts: Record<string, any>;
  memory: ConversationMemory[];
  personality?: string;
}

export interface ProjectPhase {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  tasks: string[];
}

export interface ConversationMemory {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: any;
}

export interface AgentResponse {
  success: boolean;
  message: string;
  data?: any;
  nextPhase?: AgentPhase;
  artifacts?: any[];
  analytics?: {
      tokenUsage: number;
      latencyMs: number;
  };
}

// Phase Outputs
export interface ResearchOutput {
  reasoning: string; // Chain of thought
  marketAnalysis: string;
  recommendedTechStack: {
    frontend: string;
    backend: string;
    database: string;
    infrastructure: string;
  };
  pros: string[];
  cons: string[];
  challenges: string[];
}

export interface PlanOutput {
  reasoning: string; // Chain of thought
  databaseSchema: string; // Prisma Code
  apiEndpoints: {
    method: string;
    path: string;
    description: string;
  }[];
  userStories: string[];
  architectureDiagram?: string; // Mermaid code
}

export interface PhasingOutput {
  reasoning: string; // Chain of thought
  phases: {
     id: string;
     title: string;
     description: string;
     tasks: string[];
  }[];
  criticalPath: string[];
  estimatedDuration: string;
}

export interface MasterContextOutput {
  reasoning: string; // Chain of thought
  fileContext: string; // The "God Prompt" markdown
  projectSummary: string;
  nextSteps: string[];
}

// Renamed from 'ExecutorOutput' concept -> 'PromptContextOutput'
export interface ExecutorOutput {
  reasoning: string; 
  systemPrompt: string;    // The detailed System Instruction for the agent
  userPromptTemplate: string; // The template for user interaction
  contextFiles: {          // Supporting context files (RAG)
    name: string;
    content: string;
    description: string;
  }[];
  exampleInteractions: {   // Few-shot examples
    user: string;
    assistant: string;
  }[];
}

// Renamed from 'AuditorOutput' -> 'PromptAuditOutput'
export interface AuditorOutput {
  reasoning: string; // Chain of thought
  score: number; // 0-100 indicating Prompt Quality
  issues: {
    severity: 'critical' | 'warning' | 'info';
    message: string;
    suggestion: string;
  }[];
  isApproved: boolean; // Is the prompt ready for the agent?
  finalThoughts: string;
}

export interface ReviewerOutput {
  reasoning: string; // Chain of thought
  reviewNotes: string;
  signOff: boolean;
  nextIterationSuggestions: string[];
}






