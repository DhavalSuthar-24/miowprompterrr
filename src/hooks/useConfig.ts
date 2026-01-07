import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { queryKeys } from "../lib/queryClient";
import { useConfigStore } from "../stores";
import type {
  Personality,
  PresetMode,
  Tier,
  TaskType,
  ReasoningTemplate,
  QuickTemplate,
  SelectOption,
  ConfigBundle,
} from "../lib/schemas";

/**
 * Fetch all configuration at once and populate store
 */
export function useConfig() {
  const setConfig = useConfigStore((state) => state.setConfig);

  return useQuery({
    queryKey: queryKeys.config.all,
    queryFn: async () => {
      const response = await api.get<ConfigBundle>("/api/config");
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch config");
      }

      // Populate store
      setConfig({
        personalities: response.data.personalities,
        presets: response.data.presets,
        tiers: response.data.tiers,
        taskTypes: response.data.taskTypes,
        reasoningTemplates: response.data.reasoningTemplates,
        quickTemplates: response.data.quickTemplates,
        options: response.data.options,
      });

      return response.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes for config
  });
}

/**
 * Fetch personalities list
 */
export function usePersonalities() {
  const setPersonalities = useConfigStore((state) => state.setPersonalities);

  return useQuery({
    queryKey: queryKeys.config.personalities,
    queryFn: async () => {
      const response = await api.get<Personality[]>("/api/personalities");
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch personalities");
      }
      setPersonalities(response.data);
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch single personality by ID
 */
export function usePersonality(id: string) {
  return useQuery({
    queryKey: queryKeys.config.personality(id),
    queryFn: async () => {
      const response = await api.get<Personality>(`/api/personalities/${id}`);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch personality");
      }
      return response.data;
    },
    enabled: !!id,
  });
}

/**
 * Fetch preset modes
 */
export function usePresets() {
  const setPresets = useConfigStore((state) => state.setPresets);

  return useQuery({
    queryKey: queryKeys.config.presets,
    queryFn: async () => {
      const response = await api.get<PresetMode[]>("/api/presets");
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch presets");
      }
      setPresets(response.data);
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch tiers with techniques
 */
export function useTiers() {
  const setTiers = useConfigStore((state) => state.setTiers);

  return useQuery({
    queryKey: queryKeys.config.tiers,
    queryFn: async () => {
      const response = await api.get<Tier[]>("/api/tiers");
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch tiers");
      }
      setTiers(response.data);
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch task types
 */
export function useTaskTypes() {
  const setTaskTypes = useConfigStore((state) => state.setTaskTypes);

  return useQuery({
    queryKey: queryKeys.config.taskTypes,
    queryFn: async () => {
      const response = await api.get<TaskType[]>("/api/task-types");
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch task types");
      }
      setTaskTypes(response.data);
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch reasoning templates
 */
export function useReasoningTemplates() {
  const setReasoningTemplates = useConfigStore((state) => state.setReasoningTemplates);

  return useQuery({
    queryKey: queryKeys.config.templates.reasoning,
    queryFn: async () => {
      const response = await api.get<ReasoningTemplate[]>("/api/templates/reasoning");
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch reasoning templates");
      }
      setReasoningTemplates(response.data);
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch quick templates
 */
export function useQuickTemplates() {
  const setQuickTemplates = useConfigStore((state) => state.setQuickTemplates);

  return useQuery({
    queryKey: queryKeys.config.templates.quick,
    queryFn: async () => {
      const response = await api.get<QuickTemplate[]>("/api/templates/quick");
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch quick templates");
      }
      setQuickTemplates(response.data);
      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch select options by type
 */
export function useOptions(type?: string) {
  const setOptions = useConfigStore((state) => state.setOptions);
  const currentOptions = useConfigStore((state) => state.options);

  return useQuery({
    queryKey: queryKeys.config.options(type),
    queryFn: async () => {
      const endpoint = type ? `/api/options/${type}` : "/api/options";
      const response = await api.get<SelectOption[] | Record<string, SelectOption[]>>(endpoint);
      if (!response.success || !response.data) {
        throw new Error(response.message || "Failed to fetch options");
      }

      // If fetching all options, update store
      if (!type && typeof response.data === "object" && !Array.isArray(response.data)) {
        setOptions(response.data as Record<string, SelectOption[]>);
      } else if (type && Array.isArray(response.data)) {
        setOptions({ ...currentOptions, [type]: response.data as SelectOption[] });
      }

      return response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}
