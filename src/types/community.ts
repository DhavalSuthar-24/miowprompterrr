// ============================================================================
// COMMUNITY TYPES - Reddit-like features
// ============================================================================

// Prompt Status
export type PromptStatus = 'DRAFT' | 'PUBLISHED' | 'HIDDEN' | 'FLAGGED' | 'DELETED';

// Vote Types
export type VoteValue = 1 | -1 | 0;

// Tag
export interface Tag {
  id: string;
  name: string;
  slug: string;
  color?: string;
  useCount: number;
}

// Author (simplified user for display)
export interface Author {
  id: string;
  username: string;
  name: string;
  image?: string;
}

// Prompt
export interface Prompt {
  id: string;
  title: string;
  content: string;
  author: Author;
  personalityId?: string;
  personalityName?: string;
  presetModeId?: string;
  presetModeName?: string;
  tags: Tag[];
  upvotes: number;
  downvotes: number;
  score: number;
  viewCount: number;
  copyCount: number;
  commentCount: number;
  status: PromptStatus;
  isFeatured: boolean;
  userVote?: VoteValue;
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
}

// Prompt List Item (lighter version for lists)
export interface PromptListItem {
  id: string;
  title: string;
  contentPreview: string;
  author: Author;
  personalityName?: string;
  tags: Pick<Tag, 'id' | 'name' | 'slug'>[];
  score: number;
  commentCount: number;
  userVote?: VoteValue;
  isSaved?: boolean;
  createdAt: string;
}

// Create/Edit Prompt
export interface CreatePromptData {
  title: string;
  content: string;
  personalityId?: string;
  presetModeId?: string;
  tags: string[]; // Tag names or IDs
  status?: PromptStatus;
}

export interface UpdatePromptData extends Partial<CreatePromptData> {
  id: string;
}

// Comment
export interface Comment {
  id: string;
  content: string;
  author: Author;
  promptId: string;
  parentId?: string;
  replies?: Comment[];
  upvotes: number;
  score: number;
  userVote?: VoteValue;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentData {
  content: string;
  promptId: string;
  parentId?: string;
}

// Vote Action
export interface VoteData {
  value: VoteValue;
  promptId?: string;
  commentId?: string;
}

// Filters for prompt listing
export type PromptSortBy = 'hot' | 'top' | 'new' | 'controversial';
export type PromptTimeFilter = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';

export interface PromptFilters {
  search?: string;
  sortBy?: PromptSortBy;
  timeFilter?: PromptTimeFilter;
  personalityId?: string;
  presetModeId?: string;
  tags?: string[];
  authorId?: string;
  status?: PromptStatus;
  isFeatured?: boolean;
}

// User Stats
export interface UserStats {
  reputation: number;
  promptCount: number;
  commentCount: number;
  totalUpvotes: number;
  streak: number;
}

// Badge
export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

// User Profile
export interface UserProfile extends Author {
  bio?: string;
  stats: UserStats;
  badges: Badge[];
  recentPrompts: PromptListItem[];
  joinedAt: string;
}

// Save/Bookmark
export interface SavedPrompt {
  id: string;
  prompt: PromptListItem;
  savedAt: string;
}

// Trending Data
export interface TrendingTag {
  tag: Tag;
  recentCount: number;
  growth: number; // percentage
}

export interface TopContributor {
  user: Author;
  score: number;
  promptCount: number;
}
