// ============================================================================
// PERSONALITY TYPES
// ============================================================================

export interface Personality {
  id: string;
  name: string;
  desc: string;
  icon: string;
  age?: string;
  iq?: string;
  traits?: string;
  rules?: string;
  expertise?: string;
  reasoningStyle?: string;
  cognitiveApproach?: string;
  thinkingFramework?: string;
  strengthAreas?: string[];
  specialAbilities?: string[];
  outputFormatExample?: string;
}

// ============================================================================
// PRESET MODE TYPES
// ============================================================================

export interface PresetModeConfig {
  tier: TierId;
  technique: string;
  roleAssignment: string;
  tone: Tone;
  useXML: boolean;
  chainOfThought?: boolean;
  verification?: boolean;
  reasoningMode?: boolean;
  reasoningSteps?: string;
  personality: string;
  iqLevel?: string;
  expertise?: string;
  focusAreas?: string[];
  constraints?: string[];
  // Advanced NET Framework options
  selfConsistency?: boolean;
  samplingPaths?: number;
  treeOfThoughts?: boolean;
  explorationDepth?: number;
  branchingFactor?: number;
  reactLoop?: boolean;
  maxIterations?: number;
  metaPrompting?: boolean;
  structureFocus?: boolean;
  multimodalCoT?: boolean;
  rationaleGeneration?: boolean;
  answerInference?: boolean;
  automaticOptimization?: boolean;
  generatorMode?: boolean;
  evaluatorMode?: boolean;
  netFramework?: boolean;
  multiTechnique?: boolean;
  adaptiveSelection?: boolean;
  interestMode?: string;
  perspectiveMode?: string;
  performanceGain?: string;
}

export interface PresetMode {
  id: string;
  name: string;
  desc: string;
  config: PresetModeConfig;
}

// ============================================================================
// TASK TYPES
// ============================================================================

export type TaskTypeValue =
  | 'general'
  | 'qa'
  | 'classification'
  | 'creative'
  | 'analysis'
  | 'coding'
  | 'extraction'
  | 'tutoring'
  | 'summarization'
  | 'translation'
  | 'brainstorm'
  | 'debugging'
  | 'research'
  | 'multimodal'
  | 'planning'
  | 'optimization';

export interface TaskType {
  value: TaskTypeValue;
  label: string;
}

export type RolePresets = Record<TaskTypeValue, string>;

// ============================================================================
// TIER & TECHNIQUE TYPES
// ============================================================================

export type TierId = 'tier1' | 'tier2' | 'tier3' | 'tier4' | 'tier5';

export interface Tier {
  id: TierId;
  label: string;
  color: string;
  desc: string;
}

export interface Technique {
  id: string;
  label: string;
  desc: string;
}

export type TechniquesByTier = Record<TierId, Technique[]>;

// ============================================================================
// REASONING TEMPLATE TYPES
// ============================================================================

export interface ReasoningTemplate {
  name: string;
  steps: string[];
}

export type ReasoningTemplateKey =
  | 'standard'
  | 'creative'
  | 'analytical'
  | 'problemSolving'
  | 'selfConsistency'
  | 'treeOfThoughts'
  | 'react'
  | 'metaPrompting'
  | 'multimodalCoT'
  | 'generatedKnowledge';

export type ReasoningTemplates = Record<ReasoningTemplateKey, ReasoningTemplate>;

// ============================================================================
// MODE TYPES
// ============================================================================

export interface InterestMode {
  id: string;
  label: string;
  prefix: string;
}

export interface PerspectiveMode {
  id: string;
  label: string;
}

// ============================================================================
// OPTION TYPES
// ============================================================================

export type Tone =
  | 'professional'
  | 'casual'
  | 'academic'
  | 'creative'
  | 'technical'
  | 'friendly'
  | 'authoritative'
  | 'empathetic'
  | 'humorous'
  | 'formal'
  | 'conversational'
  | 'inspirational';

export type FocusOption =
  | 'Accuracy'
  | 'Creativity'
  | 'Speed'
  | 'Detail'
  | 'Simplicity'
  | 'Depth'
  | 'Originality'
  | 'Practicality'
  | 'Reliability'
  | 'Exploration'
  | 'Optimization'
  | 'Multimodal'
  | 'Action-Oriented'
  | 'Adaptability'
  | 'Comprehensiveness'
  | 'Novelty';

export type ConstraintOption =
  | 'No assumptions'
  | 'Be concise'
  | 'Cite sources'
  | 'Use examples'
  | 'Be formal'
  | 'Step-by-step'
  | 'Avoid jargon'
  | 'Use analogies'
  | 'Generate multiple solutions'
  | 'Compare approaches'
  | 'Select consensus'
  | 'Explore alternatives'
  | 'Evaluate paths'
  | 'Backtrack if needed'
  | 'Think then act'
  | 'Observe results'
  | 'Iterate until solved'
  | 'Define clear structure'
  | 'Decompose into subtasks'
  | 'Synthesize results'
  | 'Consider all modalities'
  | 'Generate rationale first'
  | 'Then infer answer'
  | 'Verify with external sources'
  | 'Cross-validate results'
  | 'Document reasoning'
  | 'Explain trade-offs';

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export type TemplateCategory =
  | 'Structure'
  | 'Ideation'
  | 'Analysis'
  | 'Teaching'
  | 'Refinement'
  | 'Learning'
  | 'Advanced Reasoning';

export interface QuickTemplate {
  name: string;
  template: string;
  category: TemplateCategory;
}

// ============================================================================
// ADVANCED TECHNIQUE GUIDE TYPES
// ============================================================================

export interface AdvancedTechniqueInfo {
  name: string;
  description: string;
  whenToUse: string;
  benefits: string[];
  implementation: string;
  researchBasis: string;
  performanceGain: string;
  tokenCost: string;
}

export type AdvancedTechniqueGuide = Record<string, AdvancedTechniqueInfo>;

// ============================================================================
// NET FRAMEWORK TYPES
// ============================================================================

export interface NETLayer {
  name: string;
  description: string;
  techniques: string[];
  purpose: string;
}

export interface NETDecisionEntry {
  techniques: string[];
  expectedPerformance: string;
}

export interface NETFramework {
  name: string;
  description: string;
  version: string;
  researchBasis: string;
  components: {
    layer1: NETLayer;
    layer2: NETLayer;
    layer3: NETLayer;
    layer4: NETLayer;
  };
  decisionMatrix: Record<string, NETDecisionEntry>;
  performanceMetrics: Record<string, string>;
  recommendedCombinations: Record<string, string[]>;
  adaptiveSelection: Record<string, string>;
}

// ============================================================================
// BENCHMARK TYPES
// ============================================================================

export interface BaselineMethod {
  name: string;
  accuracy: string;
  speed: string;
  reliability: string;
  complexity: string;
}

export interface AdvancedMethod extends BaselineMethod {
  improvement: string;
  bestFor: string[];
}

export interface PerformanceBenchmarks {
  baselineMethods: Record<string, BaselineMethod>;
  advancedMethods: Record<string, AdvancedMethod>;
  netFrameworkCombined: {
    name: string;
    accuracy: string;
    improvement: string;
    speed: string;
    reliability: string;
    complexity: string;
    advantage: string;
  };
}

// ============================================================================
// RESEARCH REFERENCE TYPES
// ============================================================================

export interface ResearchReference {
  id: number;
  author: string;
  year: number;
  title: string;
  institutions: string[];
  arxiv: string;
  keyFinding: string;
}

// ============================================================================
// FULL CONSTANTS EXPORT TYPE
// ============================================================================

export interface Constants {
  personalities: Personality[];
  presetModes: PresetMode[];
  taskTypes: TaskType[];
  rolePresets: RolePresets;
  techniquesByTier: TechniquesByTier;
  tiers: Tier[];
  reasoningTemplates: ReasoningTemplates;
  interestModes: InterestMode[];
  perspectiveModes: PerspectiveMode[];
  tones: Tone[];
  focusOptions: FocusOption[];
  constraintOptions: ConstraintOption[];
  quickTemplates: QuickTemplate[];
  advancedTechniqueGuide: AdvancedTechniqueGuide;
  netFramework: NETFramework;
  performanceBenchmarks: PerformanceBenchmarks;
  researchReferences: ResearchReference[];
}
