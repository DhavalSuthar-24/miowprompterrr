import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys } from "../lib/queryClient";
import { toast } from "../stores/uiStore";
import type { Comment } from "../lib/schemas";

/**
 * Fetch comments for a prompt
 */
export function useComments(promptId: string, sortBy: "top" | "new" | "old" = "top") {
  return useQuery({
    queryKey: queryKeys.prompts.comments(promptId),
    queryFn: async () => {
      const response = await api.get<Comment[]>(
        `/api/prompts/${promptId}/comments?sortBy=${sortBy}`
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch comments");
      }
      return response.data || [];
    },
    enabled: !!promptId,
  });
}

/**
 * Fetch replies for a comment
 */
export function useCommentReplies(commentId: string) {
  return useQuery({
    queryKey: ["comments", commentId, "replies"],
    queryFn: async () => {
      const response = await api.get<Comment[]>(`/api/comments/${commentId}/replies`);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch replies");
      }
      return response.data || [];
    },
    enabled: !!commentId,
  });
}

interface CreateCommentData {
  promptId: string;
  content: string;
  parentId?: string;
}

/**
 * Create comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ promptId, content, parentId }: CreateCommentData) => {
      const response = await api.post<Comment>(
        `/api/prompts/${promptId}/comments`,
        { content, parentId }
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to add comment");
      }
      return { promptId, comment: response.data };
    },
    onSuccess: ({ promptId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prompts.comments(promptId),
      });
      toast.success("Comment added");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Update comment
 */
export function useUpdateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      content,
      promptId,
    }: {
      commentId: string;
      content: string;
      promptId: string;
    }) => {
      const response = await api.patch<Comment>(`/api/comments/${commentId}`, {
        content,
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to update comment");
      }
      return { promptId, comment: response.data };
    },
    onSuccess: ({ promptId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prompts.comments(promptId),
      });
      toast.success("Comment updated");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Delete comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      promptId,
    }: {
      commentId: string;
      promptId: string;
    }) => {
      const response = await api.delete(`/api/comments/${commentId}`);
      if (!response.success) {
        throw new Error(response.message || "Failed to delete comment");
      }
      return { promptId };
    },
    onSuccess: ({ promptId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prompts.comments(promptId),
      });
      toast.success("Comment deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Vote on comment
 */
export function useVoteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      value,
      promptId,
    }: {
      commentId: string;
      value: 1 | -1;
      promptId: string;
    }) => {
      const response = await api.post<{ userVote: number | null; upvotes: number; score: number }>(
        `/api/comments/${commentId}/vote`,
        { value }
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to vote");
      }
      return { promptId, commentId, ...response.data };
    },
    onSuccess: ({ promptId }) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.prompts.comments(promptId),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
