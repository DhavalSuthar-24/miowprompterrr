import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys } from "../lib/queryClient";
import { useAuthStore } from "../stores";
import type { Prompt, AuthUser, Pagination } from "../lib/schemas";

interface UserProfile {
  id: string;
  name: string;
  username: string;
  image: string | null;
  createdAt: string;
  stats: {
    reputation: number;
    promptCount: number;
    totalUpvotes: number;
  };
}

interface UserPromptsResponse {
  user: UserProfile;
  prompts: Prompt[];
  pagination: Pagination;
}

/**
 * Get current authenticated user
 */
export function useCurrentUser() {
  const { user, isAuthenticated } = useAuthStore();
  return { user, isAuthenticated };
}

/**
 * Fetch user profile with prompts
 */
export function useUserProfile(userId: string) {
  return useQuery({
    queryKey: queryKeys.users.profile(userId),
    queryFn: async () => {
      const response = await api.get<UserPromptsResponse>(
        `/api/users/${userId}/prompts`
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch user profile");
      }
      return response.data;
    },
    enabled: !!userId,
  });
}

/**
 * Fetch user's prompts
 */
export function useUserPrompts(userId: string, page = 1) {
  return useQuery({
    queryKey: queryKeys.users.prompts(userId),
    queryFn: async () => {
      const response = await api.get<UserPromptsResponse>(
        `/api/users/${userId}/prompts?page=${page}`
      );
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch user prompts");
      }
      return {
        prompts: response.data.prompts,
        pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    },
    enabled: !!userId,
  });
}

interface SavedPromptItem {
  savedAt: string;
  prompt: Prompt;
}

/**
 * Fetch saved prompts (own user only)
 */
export function useSavedPrompts(page = 1) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.users.saved(user?.id || ""),
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");
      
      const response = await api.get<SavedPromptItem[]>(
        `/api/users/${user.id}/saved?page=${page}`
      );
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch saved prompts");
      }
      return {
        data: response.data || [],
        pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    },
    enabled: !!user?.id,
  });
}

/**
 * Refresh current user from token
 */
export function useRefreshUser() {
  const { login, logout } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.auth.user,
    queryFn: async () => {
      const response = await api.get<{ user: AuthUser; accessToken: string }>("/auth/refresh");
      
      if (!response.success || !response.data) {
        logout();
        return null;
      }

      login(response.data.user, response.data.accessToken);
      return response.data.user;
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
