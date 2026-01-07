import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys } from "../lib/queryClient";
import { toast } from "../stores/uiStore";
import { 
  AdminStats, UserStatsGraph, AdminUser,
  CreatePersonalityData, UpdatePersonalityData,
  CreatePresetData, UpdatePresetData,
  CreateTierData, UpdateTierData,
  CreateTechniqueData, UpdateTechniqueData,
  ModerationPrompt
} from "../types/admin";
import { Personality, PresetMode, Tier, ReasoningTemplate, QuickTemplate } from "../lib/schemas";

// ============================================================================
// DASHBOARD STATS
// ============================================================================

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats", "overview"],
    queryFn: async () => {
      const response = await api.get<AdminStats>("/api/admin/stats");
      if (!response.success || !response.data) throw new Error("Failed to fetch admin stats");
      return response.data;
    },
  });
}

export function useUserGrowthStats(days = 30) {
  return useQuery({
    queryKey: ["admin", "stats", "users", days],
    queryFn: async () => {
      const response = await api.get<UserStatsGraph>(`/api/admin/stats/users?days=${days}`);
      if (!response.success || !response.data) throw new Error("Failed to fetch user stats");
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 mins
  });
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export function useAdminUsers(params: { page?: number; limit?: number; search?: string; role?: string } = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.search) queryParams.append("search", params.search);
  if (params.role) queryParams.append("role", params.role);

  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const response = await api.get<AdminUser[]>(`/api/admin/users?${queryParams.toString()}`);
      if (!response.success) throw new Error("Failed to fetch users");
      return {
        users: response.data || [],
        pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AdminUser> }) => {
      const response = await api.put(`/api/admin/users/${id}`, data);
      if (!response.success) throw new Error(response.message || "Failed to update user");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User updated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ============================================================================
// CONTENT MANAGEMENT - PERSONALITIES
// ============================================================================

export function useAdminPersonalities(includeInactive = true) {
  return useQuery({
    queryKey: ["admin", "personalities", { includeInactive }],
    queryFn: async () => {
      const response = await api.get<Personality[]>("/api/admin/content/personalities?includeInactive=" + includeInactive);
      if (!response.success || !response.data) throw new Error("Failed to fetch personalities");
      return response.data;
    },
  });
}

export function useCreatePersonality() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePersonalityData) => {
      const response = await api.post("/api/admin/content/personalities", data);
      if (!response.success) throw new Error(response.message || "Failed to create personality");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "personalities"] });
      // Also invalidate public config
      queryClient.invalidateQueries({ queryKey: queryKeys.config.personalities });
      toast.success("Personality created successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdatePersonality() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePersonalityData }) => {
      const response = await api.put(`/api/admin/content/personalities/${id}`, data);
      if (!response.success) throw new Error(response.message || "Failed to update personality");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "personalities"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.personalities });
      toast.success("Personality updated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeletePersonality() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/admin/content/personalities/${id}`);
      if (!response.success) throw new Error(response.message || "Failed to delete personality");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "personalities"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.personalities });
      toast.success("Personality deactivated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ============================================================================
// CONTENT MANAGEMENT - PRESETS
// ============================================================================

export function useAdminPresets() {
  return useQuery({
    queryKey: ["admin", "presets"],
    queryFn: async () => {
      const response = await api.get<PresetMode[]>("/api/admin/content/presets");
      if (!response.success || !response.data) throw new Error("Failed to fetch presets");
      return response.data;
    },
  });
}

export function useCreatePreset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreatePresetData) => {
      const response = await api.post("/api/admin/content/presets", data);
      if (!response.success) throw new Error(response.message || "Failed to create preset");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "presets"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.presets });
      toast.success("Preset created successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdatePreset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePresetData }) => {
      const response = await api.put(`/api/admin/content/presets/${id}`, data);
      if (!response.success) throw new Error(response.message || "Failed to update preset");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "presets"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.presets });
      toast.success("Preset updated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeletePreset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/admin/content/presets/${id}`);
      if (!response.success) throw new Error(response.message || "Failed to delete preset");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "presets"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.presets });
      toast.success("Preset deactivated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ============================================================================
// CONTENT MANAGEMENT - TIERS
// ============================================================================

export function useAdminTiers() {
  return useQuery({
    queryKey: ["admin", "tiers"],
    queryFn: async () => {
      const response = await api.get<Tier[]>("/api/admin/content/tiers");
      if (!response.success || !response.data) throw new Error("Failed to fetch tiers");
      return response.data;
    },
  });
}

export function useCreateTier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTierData) => {
      const response = await api.post("/api/admin/content/tiers", data);
      if (!response.success) throw new Error(response.message || "Failed to create tier");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tiers"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.tiers });
      toast.success("Tier created successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateTier() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTierData }) => {
      const response = await api.put(`/api/admin/content/tiers/${id}`, data);
      if (!response.success) throw new Error(response.message || "Failed to update tier");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tiers"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.tiers });
      toast.success("Tier updated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCreateTechnique() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTechniqueData) => {
      const response = await api.post("/api/admin/content/techniques", data);
      if (!response.success) throw new Error(response.message || "Failed to create technique");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tiers"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.tiers });
      toast.success("Technique created successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateTechnique() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTechniqueData }) => {
      const response = await api.put(`/api/admin/content/techniques/${id}`, data);
      if (!response.success) throw new Error(response.message || "Failed to update technique");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tiers"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.tiers });
      toast.success("Technique updated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteTechnique() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/api/admin/content/techniques/${id}`);
      if (!response.success) throw new Error(response.message || "Failed to delete technique");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tiers"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.tiers });
      toast.success("Technique deleted successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ============================================================================
// CONTENT MANAGEMENT - TEMPLATES
// ============================================================================

export function useAdminReasoningTemplates() {
  return useQuery({
    queryKey: ["admin", "templates", "reasoning"],
    queryFn: async () => {
      const response = await api.get<ReasoningTemplate[]>("/api/admin/more/templates/reasoning");
      if (!response.success || !response.data) throw new Error("Failed to fetch reasoning templates");
      return response.data;
    },
  });
}

export function useCreateReasoningTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<ReasoningTemplate>) => {
      const response = await api.post("/api/admin/more/templates/reasoning", data);
      if (!response.success) throw new Error(response.message || "Failed to create template");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "templates", "reasoning"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.templates.reasoning });
      toast.success("Template created successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateReasoningTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ReasoningTemplate> }) => {
      const response = await api.put(`/api/admin/more/templates/reasoning/${id}`, data);
      if (!response.success) throw new Error(response.message || "Failed to update template");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "templates", "reasoning"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.templates.reasoning });
      toast.success("Template updated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useAdminQuickTemplates() {
  return useQuery({
    queryKey: ["admin", "templates", "quick"],
    queryFn: async () => {
      const response = await api.get<QuickTemplate[]>("/api/admin/more/templates/quick");
      if (!response.success || !response.data) throw new Error("Failed to fetch quick templates");
      return response.data;
    },
  });
}

export function useCreateQuickTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<QuickTemplate>) => {
      const response = await api.post("/api/admin/more/templates/quick", data);
      if (!response.success) throw new Error(response.message || "Failed to create template");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "templates", "quick"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.templates.quick });
      toast.success("Template created successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateQuickTemplate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<QuickTemplate> }) => {
      const response = await api.put(`/api/admin/more/templates/quick/${id}`, data);
      if (!response.success) throw new Error(response.message || "Failed to update template");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "templates", "quick"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.config.templates.quick });
      toast.success("Template updated successfully");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

// ============================================================================
// MODERATION
// ============================================================================

export function useModerationPrompts(params: { page?: number; limit?: number; status?: string; search?: string } = {}) {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page.toString());
  if (params.limit) queryParams.append("limit", params.limit.toString());
  if (params.status) queryParams.append("status", params.status);
  if (params.search) queryParams.append("search", params.search);

  return useQuery({
    queryKey: ["admin", "moderation", "prompts", params],
    queryFn: async () => {
      const response = await api.get<ModerationPrompt[]>(`/api/admin/moderation/prompts?${queryParams.toString()}`);
      if (!response.success) throw new Error("Failed to fetch prompts");
      return {
        prompts: response.data || [],
        pagination: response.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
      };
    },
  });
}

export function useUpdatePromptStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await api.put(`/api/admin/moderation/prompts/${id}/status`, { status });
      if (!response.success) throw new Error(response.message || "Failed to update status");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "moderation", "prompts"] });
      // Also invalidate public prompt feeds
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts.all });
      toast.success("Prompt status updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
