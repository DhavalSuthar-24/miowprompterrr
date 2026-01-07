// Custom Hooks Index - Merged exports

// Legacy JS hooks
export { useMiowNationLogic } from './useMiowNationLogic.js';
export { usePromptHistory, usePromptScorer, usePromptLibrary } from './usePromptFeatures.js';

// Configuration hooks
export {
  useConfig,
  usePersonalities,
  usePersonality,
  usePresets,
  useTiers,
  useTaskTypes,
  useReasoningTemplates,
  useQuickTemplates,
  useOptions,
} from "./useConfig";

// Community hooks
export {
  usePrompts,
  useInfinitePrompts,
  usePrompt,
  useCreatePrompt,
  useUpdatePrompt,
  useDeletePrompt,
  useVotePrompt,
  useCopyPrompt,
  useSavePrompt,
  useTags,
  usePopularTags,
  useTag,
  useFeed,
} from "./usePrompts";

// Comments hooks
export {
  useComments,
  useCommentReplies,
  useCreateComment,
  useUpdateComment,
  useDeleteComment,
  useVoteComment,
} from "./useComments";

// User hooks
export {
  useCurrentUser,
  useUserProfile,
  useUserPrompts,
  useSavedPrompts,
  useRefreshUser,
  useUpdateProfile,
  useChangePassword,
} from "./useUser";

// Admin hooks
export * from "./useAdmin";
