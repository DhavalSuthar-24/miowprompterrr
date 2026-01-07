import React, { createContext, useContext } from "react";
import { useConfig } from "../hooks/useConfig";
import { useConfigStore } from "../stores";
import type {
  Personality,
  PresetMode,
  Tier,
  TaskType,
  ReasoningTemplate,
  QuickTemplate,
  SelectOption,
} from "../lib/schemas";

interface ConfigContextType {
  // Data
  personalities: Personality[];
  presets: PresetMode[];
  tiers: Tier[];
  taskTypes: TaskType[];
  reasoningTemplates: ReasoningTemplate[];
  quickTemplates: QuickTemplate[];
  options: Record<string, SelectOption[]>;

  // State
  isLoading: boolean;
  isLoaded: boolean;
  error: Error | null;

  // Helpers
  getPersonalityBySlug: (slug: string) => Personality | undefined;
  getPresetBySlug: (slug: string) => PresetMode | undefined;
  getTierBySlug: (slug: string) => Tier | undefined;
  getOptionsByType: (type: string) => SelectOption[];
  getDefaultPersonality: () => Personality | undefined;
  getDefaultPreset: () => PresetMode | undefined;

  // Actions
  refetch: () => void;
}

const ConfigContext = createContext<ConfigContextType | null>(null);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const { isLoading, error, refetch } = useConfig();
  
  // Get data and helpers from store
  const personalities = useConfigStore((s) => s.personalities);
  const presets = useConfigStore((s) => s.presets);
  const tiers = useConfigStore((s) => s.tiers);
  const taskTypes = useConfigStore((s) => s.taskTypes);
  const reasoningTemplates = useConfigStore((s) => s.reasoningTemplates);
  const quickTemplates = useConfigStore((s) => s.quickTemplates);
  const options = useConfigStore((s) => s.options);
  const isLoaded = useConfigStore((s) => s.isLoaded);
  const getPersonalityBySlug = useConfigStore((s) => s.getPersonalityBySlug);
  const getPresetBySlug = useConfigStore((s) => s.getPresetBySlug);
  const getTierBySlug = useConfigStore((s) => s.getTierBySlug);
  const getOptionsByType = useConfigStore((s) => s.getOptionsByType);
  const getDefaultPersonality = useConfigStore((s) => s.getDefaultPersonality);
  const getDefaultPreset = useConfigStore((s) => s.getDefaultPreset);

  const value: ConfigContextType = {
    personalities,
    presets,
    tiers,
    taskTypes,
    reasoningTemplates,
    quickTemplates,
    options,
    isLoading,
    isLoaded,
    error: error as Error | null,
    getPersonalityBySlug,
    getPresetBySlug,
    getTierBySlug,
    getOptionsByType,
    getDefaultPersonality,
    getDefaultPreset,
    refetch,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfigContext() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfigContext must be used within ConfigProvider");
  }
  return context;
}

// Hook for checking if config is ready
export function useConfigReady() {
  const { isLoaded, isLoading } = useConfigContext();
  return { isReady: isLoaded && !isLoading, isLoading };
}
