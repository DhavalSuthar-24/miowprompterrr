import { User } from "../lib/schemas";

// Admin Stats
export interface AdminStats {
  overview: {
    totalUsers: number;
    totalPrompts: number;
    totalComments: number;
    totalVotes: number;
  };
  today: {
    newUsers: number;
    newPrompts: number;
  };
  moderation: {
    flaggedPrompts: number;
  };
  content: {
    activePersonalities: number;
  };
}

export interface UserStatsGraph {
  period: number;
  totalNew: number;
  dailySignups: {
    date: string;
    count: number;
  }[];
}

export interface PromptStats {
  byStatus: {
    status: string;
    count: number;
  }[];
  topPersonalities: {
    personalityId: string | null;
    personalityName: string;
    count: number;
  }[];
  recentCount: number;
}

// User Management
export interface AdminUser extends User {
  promptCount: number;
  commentCount: number;
  roles: { id: string; name: string }[];
  isActive?: boolean;
}

export interface AdminUserDetail extends AdminUser {
  stats: {
    reputation: number;
    promptCount: number;
    totalUpvotes: number;
  } | null;
  recentPrompts: {
    id: string;
    title: string;
    createdAt: string;
    status: string;
  }[];
  recentComments: {
    id: string;
    content: string;
    createdAt: string;
    promptId: string;
    promptTitle: string;
  }[];
}

// Content Management Payloads
export interface CreatePersonalityData {
  name: string;
  description: string;
  icon?: string;
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
  outputExample?: string;
  isDefault?: boolean;
}

export interface UpdatePersonalityData extends Partial<CreatePersonalityData> {
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreatePresetData {
  name: string;
  description: string;
  config: Record<string, unknown>;
  isDefault?: boolean;
}

export interface UpdatePresetData extends Partial<CreatePresetData> {
  isActive?: boolean;
  sortOrder?: number;
}

export interface CreateTierData {
  label: string;
  color: string;
  description: string;
}


export interface UpdateTierData extends Partial<CreateTierData> {
  isActive?: boolean;
  value?: number; // Keep for legacy
  sortOrder?: number;
}

export interface CreateTechniqueData {
  label: string;
  description: string;
  slug: string;
  tierId: string;
  sortOrder?: number;
}

export interface UpdateTechniqueData extends Partial<CreateTechniqueData> {
  isActive?: boolean;
}

// Moderation
export interface ModerationPrompt {
  id: string;
  title: string;
  content: string;
  status: string;
  isFeatured: boolean;
  upvotes: number;
  downvotes: number;
  score: number;
  viewCount: number;
  createdAt: string;
  author: {
    id: string;
    username: string;
    email: string;
  };
  commentCount: number;
}
