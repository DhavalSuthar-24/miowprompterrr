import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys } from "../lib/queryClient";
import { useAuthStore } from "../stores";
import type { Prompt, AuthUser, Pagination } from "../lib/schemas";
import type { UpdateProfileData, ChangePasswordData } from "../types/api";
import { toast } from "../stores/uiStore";

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
 * Update user profile
 */
export function useUpdateProfile() {
  const { login } = useAuthStore();
  const token = useAuthStore.getState().accessToken;

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await api.patch<{ user: AuthUser }>("/api/users/me", data);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to update profile");
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Update local state by re-logging in with new user data but same token
      if (token) {
        login(data.user, token);
      }
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

/**
 * Change user password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await api.post("/auth/change-password", data);
      if (!response.success) {
        throw new Error(response.message || "Failed to change password");
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
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

