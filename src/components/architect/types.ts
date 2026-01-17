export type AgentPhase = 
  | 'RESEARCH_VALIDATE'
  | 'PLAN_SRS'
  | 'PHASING_TODO'
  | 'MASTER_CONTEXT'
  | 'EXECUTE_CODE'
  | 'AUDIT_VERIFY'
  | 'REVIEW_FINALIZE';

export interface AgentMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  metadata?: any;
}

export interface AgentSession {
  id: string;
  title?: string;
  currentPhase: AgentPhase;
  messages: AgentMessage[];
  status: 'active' | 'completed' | 'failed';
  updatedAt: string;
  // State fields
  projectDescription?: string;
  techStack?: any;
  requirements?: string[];
  phases?: any;
  artifacts?: any;
  // Community fields
  isPublic?: boolean;
  tags?: string[];
}
