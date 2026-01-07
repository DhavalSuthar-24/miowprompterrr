// ============================================================================
// ADMIN TYPES
// ============================================================================

// Admin Stats
export interface AdminDashboardStats {
  users: {
    total: number;
    newToday: number;
    newThisWeek: number;
    activeToday: number;
  };
  prompts: {
    total: number;
    published: number;
    flagged: number;
    newToday: number;
  };
  engagement: {
    totalVotes: number;
    totalComments: number;
    avgPromptsPerUser: number;
  };
}

// Entity Management
export interface AdminEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  sortOrder: number;
}

// Admin Personality
export interface AdminPersonality extends AdminEntity {
  slug: string;
  name: string;
  description: string;
  icon: string;
  age?: string;
  iq?: string;
  traits?: string;
  rules?: string;
  expertise?: string;
  reasoningStyle?: string;
  cognitiveApproach?: string;
  thinkingFramework?: string;
  strengthAreas: string[];
  specialAbilities: string[];
  outputExample?: string;
  isDefault: boolean;
  createdBy?: string;
}

// Admin Preset Mode
export interface AdminPresetMode extends AdminEntity {
  slug: string;
  name: string;
  description: string;
  config: Record<string, unknown>; // JSON config
}

// Admin User
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  username: string;
  image?: string;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  roles: string[];
  createdAt: string;
  lastActiveAt?: string;
  promptCount: number;
  commentCount: number;
  reputation: number;
}

// Moderation
export interface FlaggedContent {
  id: string;
  type: 'prompt' | 'comment';
  contentId: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  flagCount: number;
  flagReasons: string[];
  status: 'pending' | 'reviewed' | 'actioned';
  createdAt: string;
}

export interface ModerationAction {
  contentId: string;
  action: 'approve' | 'hide' | 'delete' | 'warn';
  reason?: string;
}

// Activity Log
export interface ActivityLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  adminId: string;
  adminUsername: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

// Bulk Operations
export interface BulkUpdateData {
  ids: string[];
  updates: Record<string, unknown>;
}

export interface BulkDeleteData {
  ids: string[];
  hardDelete?: boolean;
}
