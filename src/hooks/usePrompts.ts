import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { api, buildPaginationParams, type Pagination } from "../lib/api";
import { queryKeys } from "../lib/queryClient";
import { toast } from "../stores/uiStore";
import type { Prompt, PromptDetail, Tag } from "../lib/schemas";

interface PromptsFilters {
  [key: string]: string | number | boolean | undefined;
  page?: number;
  limit?: number;
  sortBy?: "recent" | "top" | "hot" | "controversial" | "views";
  tag?: string;
  personality?: string;
  search?: string;
  featured?: boolean;
}

interface PromptsResponse {
  data: Prompt[];
  pagination: Pagination;
}

/**
 * Fetch prompts list with filters
 */
export function usePrompts(filters: PromptsFilters = {}) {
  return useQuery({
    queryKey: queryKeys.prompts.list(filters),
    queryFn: async () => {
      const query = buildPaginationParams(filters);
      const response = await api.get<PromptsResponse>(`/api/prompts${query}`);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch prompts");
      }
      return {
        data: response.data || [],
        pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    },
  });
}

/**
 * Infinite scroll prompts for feed
 */
export function useInfinitePrompts(filters: Omit<PromptsFilters, "page"> = {}) {
  return useInfiniteQuery({
    queryKey: ["prompts", "infinite", filters],
    queryFn: async ({ pageParam = 1 }) => {
      const query = buildPaginationParams({ ...filters, page: pageParam });
      const response = await api.get<PromptsResponse>(`/api/prompts${query}`);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch prompts");
      }
      return {
        data: response.data || [],
        pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => 
      lastPage.pagination?.hasNext ? lastPage.pagination.page + 1 : undefined,
  });
}

/**
 * Fetch single prompt
 */
export function usePrompt(id: string) {
  return useQuery({
    queryKey: queryKeys.prompts.detail(id),
    queryFn: async () => {
      const response = await api.get<PromptDetail>(`/api/prompts/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch prompt");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

interface CreatePromptData {
  title: string;
  content: string;
  personalityId?: string;
  presetModeId?: string;
  tagIds?: string[];
  status?: "DRAFT" | "PUBLISHED";
}

/**
 * Create new prompt
 */
export function useCreatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePromptData) => {
      const response = await api.post<Prompt>("/api/prompts", data);
      if (!response.success) {
        throw new Error(response.message || "Failed to create prompt");
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      toast.success("Prompt created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Update prompt
 */
export function useUpdatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: CreatePromptData & { id: string }) => {
      const response = await api.patch<Prompt>(`/api/prompts/${id}`, data);
      if (!response.success) {
        throw new Error(response.message || "Failed to update prompt");
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prompts.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts.all });
      toast.success("Prompt updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Delete prompt
 */
export function useDeletePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/prompts/${id}`);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete prompt");
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.feed.all });
      toast.success("Prompt deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

interface VoteData {
  promptId: string;
  value: 1 | -1;
}

interface VoteResponse {
  userVote: number | null;
  upvotes: number;
  downvotes: number;
  score: number;
}

/**
 * Vote on prompt
 */
export function useVotePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ promptId, value }: VoteData) => {
      const response = await api.post<VoteResponse>(
        `/api/prompts/${promptId}/vote`,
        { value }
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to vote");
      }
      return { promptId, ...response.data };
    },
    onSuccess: (data) => {
      // Optimistically update the prompt in cache
      queryClient.setQueryData(
        queryKeys.prompts.detail(data.promptId),
        (old: PromptDetail | undefined) =>
          old
            ? {
                ...old,
                userVote: data.userVote,
                upvotes: data.upvotes,
                downvotes: data.downvotes,
                score: data.score,
              }
            : old
      );
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Copy prompt (increment copy count)
 */
export function useCopyPrompt() {
  return useMutation({
    mutationFn: async (promptId: string) => {
      const response = await api.post<{ copyCount: number }>(
        `/api/prompts/${promptId}/copy`
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to record copy");
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("Prompt copied to clipboard!");
    },
  });
}

/**
 * Save/unsave prompt
 */
export function useSavePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (promptId: string) => {
      const response = await api.post<{ saved: boolean }>(
        `/api/prompts/${promptId}/save`
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to save prompt");
      }
      return { promptId, saved: response.data?.saved };
    },
    onSuccess: (data) => {
      // Update the prompt in cache
      queryClient.setQueryData(
        queryKeys.prompts.detail(data.promptId),
        (old: PromptDetail | undefined) =>
          old ? { ...old, isSaved: data.saved } : old
      );
      toast.success(data.saved ? "Prompt saved" : "Prompt unsaved");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Fetch tags
 */
export function useTags() {
  return useQuery({
    queryKey: queryKeys.tags.all,
    queryFn: async () => {
      const response = await api.get<Tag[]>("/api/tags");
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch tags");
      }
      return response.data || [];
    },
  });
}

/**
 * Fetch popular tags
 */
export function usePopularTags() {
  return useQuery({
    queryKey: queryKeys.tags.popular,
    queryFn: async () => {
      const response = await api.get<Tag[]>("/api/tags/popular");
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch popular tags");
      }
      return response.data || [];
    },
  });
}

/**
 * Fetch tag with prompts
 */
export function useTag(slug: string) {
  return useQuery({
    queryKey: queryKeys.tags.detail(slug),
    queryFn: async () => {
      const response = await api.get<{ tag: Tag; prompts: Prompt[] }>(
        `/api/tags/${slug}`
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch tag");
      }
      return response.data;
    },
    enabled: !!slug,
  });
}

interface FeedFilters {
  page?: number;
  limit?: number;
  filter?: "hot" | "new" | "top" | "rising";
}

/**
 * Fetch personalized feed
 */
export function useFeed(filters: FeedFilters = {}) {
  return useQuery({
    queryKey: queryKeys.feed.list(filters.filter || "hot"),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.page) params.set("page", String(filters.page));
      if (filters.limit) params.set("limit", String(filters.limit));
      if (filters.filter) params.set("filter", filters.filter);

      const response = await api.get<PromptsResponse>(
        `/api/feed?${params.toString()}`
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch feed");
      }
      return {
        data: response.data || [],
        pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    },
  });
}
