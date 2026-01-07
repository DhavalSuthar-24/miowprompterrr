import { create } from "zustand";
import type {
  Personality,
  PresetMode,
  Tier,
  TaskType,
  ReasoningTemplate,
  QuickTemplate,
  SelectOption,
} from "../lib/schemas";

interface ConfigState {
  // Data
  personalities: Personality[];
  presets: PresetMode[];
  tiers: Tier[];
  taskTypes: TaskType[];
  reasoningTemplates: ReasoningTemplate[];
  quickTemplates: QuickTemplate[];
  options: Record<string, SelectOption[]>;

  // Meta
  isLoaded: boolean;
  lastFetchedAt: number | null;

  // Actions
  setConfig: (config: Partial<ConfigState>) => void;
  setPersonalities: (personalities: Personality[]) => void;
  setPresets: (presets: PresetMode[]) => void;
  setTiers: (tiers: Tier[]) => void;
  setTaskTypes: (taskTypes: TaskType[]) => void;
  setReasoningTemplates: (templates: ReasoningTemplate[]) => void;
  setQuickTemplates: (templates: QuickTemplate[]) => void;
  setOptions: (options: Record<string, SelectOption[]>) => void;
  markLoaded: () => void;

  // Selectors
  getPersonalityBySlug: (slug: string) => Personality | undefined;
  getPresetBySlug: (slug: string) => PresetMode | undefined;
  getTierBySlug: (slug: string) => Tier | undefined;
  getOptionsByType: (type: string) => SelectOption[];
  getDefaultPersonality: () => Personality | undefined;
  getDefaultPreset: () => PresetMode | undefined;
}

export const useConfigStore = create<ConfigState>()((set, get) => ({
  // Initial state
  personalities: [],
  presets: [],
  tiers: [],
  taskTypes: [],
  reasoningTemplates: [],
  quickTemplates: [],
  options: {},
  isLoaded: false,
  lastFetchedAt: null,

  // Setters
  setConfig: (config) =>
    set((state) => ({
      ...state,
      ...config,
      isLoaded: true,
      lastFetchedAt: Date.now(),
    })),

  setPersonalities: (personalities) => set({ personalities }),
  setPresets: (presets) => set({ presets }),
  setTiers: (tiers) => set({ tiers }),
  setTaskTypes: (taskTypes) => set({ taskTypes }),
  setReasoningTemplates: (reasoningTemplates) => set({ reasoningTemplates }),
  setQuickTemplates: (quickTemplates) => set({ quickTemplates }),
  setOptions: (options) => set({ options }),
  markLoaded: () => set({ isLoaded: true, lastFetchedAt: Date.now() }),

  // Selectors
  getPersonalityBySlug: (slug) =>
    get().personalities.find((p) => p.slug === slug),

  getPresetBySlug: (slug) =>
    get().presets.find((p) => p.slug === slug),

  getTierBySlug: (slug) =>
    get().tiers.find((t) => t.slug === slug),

  getOptionsByType: (type) =>
    get().options[type] || [],

  getDefaultPersonality: () =>
    get().personalities.find((p) => p.isDefault) || get().personalities[0],

  getDefaultPreset: () =>
    get().presets.find((p) => p.isDefault) || get().presets[0],
}));
