import { z } from "zod";

// ============================================================================
// BASE SCHEMAS
// ============================================================================

export const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

export const paginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  username: z.string(),
  image: z.string().nullable(),
  emailVerified: z.boolean(),
  createdAt: z.string(),
});

export const authUserSchema = userSchema.extend({
  roles: z.array(z.object({
    id: z.string(),
    name: z.string(),
  })),
});

// ============================================================================
// CONFIGURATION SCHEMAS
// ============================================================================

export const personalitySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string(),
  age: z.string().nullable().optional(),
  iq: z.string().nullable().optional(),
  traits: z.string().nullable().optional(),
  rules: z.string().nullable().optional(),
  expertise: z.string().nullable().optional(),
  reasoningStyle: z.string().nullable().optional(),
  cognitiveApproach: z.string().nullable().optional(),
  thinkingFramework: z.string().nullable().optional(),
  strengthAreas: z.array(z.string()).optional(),
  specialAbilities: z.array(z.string()).optional(),
  outputExample: z.string().nullable().optional(),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  sortOrder: z.number(),
});

export const presetModeSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  description: z.string(),
  config: z.record(z.string(), z.unknown()),
  isActive: z.boolean(),
  isDefault: z.boolean(),
  sortOrder: z.number(),
});

export const techniqueSchema = z.object({
  id: z.string(),
  slug: z.string(),
  label: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  sortOrder: z.number(),
});

export const tierSchema = z.object({
  id: z.string(),
  slug: z.string(),
  label: z.string(),
  color: z.string(),
  description: z.string(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  techniques: z.array(techniqueSchema),
});

export const taskTypeSchema = z.object({
  id: z.string(),
  value: z.string(),
  label: z.string(),
  rolePreset: z.string().nullable(),
  isActive: z.boolean(),
  sortOrder: z.number(),
});

export const reasoningTemplateSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  steps: z.array(z.string()),
  isActive: z.boolean(),
  sortOrder: z.number(),
});

export const quickTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  template: z.string(),
  category: z.string(),
  isActive: z.boolean(),
  sortOrder: z.number(),
});

export const selectOptionSchema = z.object({
  id: z.string(),
  type: z.string(),
  value: z.string(),
  label: z.string(),
  prefix: z.string().nullable().optional(),
  isActive: z.boolean(),
  sortOrder: z.number(),
});

// ============================================================================
// COMMUNITY SCHEMAS
// ============================================================================

export const tagSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  color: z.string().nullable(),
  useCount: z.number().optional(),
});

export const authorSchema = z.object({
  id: z.string(),
  username: z.string(),
  image: z.string().nullable(),
});

export const promptSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  upvotes: z.number(),
  downvotes: z.number(),
  score: z.number(),
  viewCount: z.number(),
  copyCount: z.number().optional(),
  commentCount: z.number(),
  isFeatured: z.boolean(),
  createdAt: z.string(),
  author: authorSchema,
  personality: personalitySchema.pick({ id: true, name: true, slug: true, icon: true }).nullable().optional(),
  presetMode: presetModeSchema.pick({ id: true, name: true, slug: true }).nullable().optional(),
  tags: z.array(tagSchema),
  userVote: z.number().nullable(),
  isSaved: z.boolean().optional(),
  remixCount: z.number().optional(),
  parent: z.object({
    id: z.string(),
    title: z.string(),
    author: z.string(),
  }).nullable().optional(),
});

export const promptDetailSchema = promptSchema.extend({
  updatedAt: z.string(),
  saveCount: z.number().optional(),
  status: z.string(),
  isOwner: z.boolean(),
});

// Base comment schema without replies (for nested use)
const baseCommentSchema = z.object({
  id: z.string(),
  content: z.string(),
  upvotes: z.number(),
  score: z.number(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
  author: authorSchema,
  replyCount: z.number(),
  userVote: z.number().nullable(),
  isOwner: z.boolean(),
});

export const commentSchema = baseCommentSchema.extend({
  hasMoreReplies: z.boolean().optional(),
  replies: z.array(baseCommentSchema).optional(),
});

// ============================================================================
// CONFIG BUNDLE SCHEMA
// ============================================================================

export const configBundleSchema = z.object({
  personalities: z.array(personalitySchema),
  presets: z.array(presetModeSchema),
  tiers: z.array(tierSchema),
  taskTypes: z.array(taskTypeSchema),
  reasoningTemplates: z.array(reasoningTemplateSchema),
  quickTemplates: z.array(quickTemplateSchema),
  options: z.record(z.string(), z.array(selectOptionSchema)),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type User = z.infer<typeof userSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type Personality = z.infer<typeof personalitySchema>;
export type PresetMode = z.infer<typeof presetModeSchema>;
export type Tier = z.infer<typeof tierSchema>;
export type Technique = z.infer<typeof techniqueSchema>;
export type TaskType = z.infer<typeof taskTypeSchema>;
export type ReasoningTemplate = z.infer<typeof reasoningTemplateSchema>;
export type QuickTemplate = z.infer<typeof quickTemplateSchema>;
export type SelectOption = z.infer<typeof selectOptionSchema>;
export type Tag = z.infer<typeof tagSchema>;
export type Author = z.infer<typeof authorSchema>;
export type Prompt = z.infer<typeof promptSchema>;
export type PromptDetail = z.infer<typeof promptDetailSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type ConfigBundle = z.infer<typeof configBundleSchema>;
export type Pagination = z.infer<typeof paginationSchema>;
