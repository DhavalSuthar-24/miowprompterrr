import React, { useState, useMemo } from "react";
import {
  Layers,
  Target,
  Sparkles,
  Brain,
  Cpu,
  Book,
  Play,
  Compass,
} from "lucide-react";
import {
  personalities as defaultPersonalities,
  presetModes as defaultPresets,
  reasoningTemplates as defaultReasoningTemplates,
  taskTypes as defaultTaskTypes,
  tiers as defaultTiers,
  quickTemplates as defaultQuickTemplates,
  netFramework, // Used for Decision Matrix in MainContent
} from "./constants"; // We will refactor constants next, but imports remain for now
import { useMiowNationLogic, useConfig } from "./hooks";
import { useConfigStore } from "./stores/configStore";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { FeatureToggleProvider, useFeatureToggle } from "./contexts/FeatureToggleContext";

// Layout Components
import { AppLayout } from "./components/layout/AppLayout";
import { MainContent } from "./components/layout/MainContent";

// Main MiowNation Component (Inner)
const MiowNationInner = () => {
  // Config Hook - Fetch Data
  const { isLoading: isConfigLoading } = useConfig();
  const store = useConfigStore();

  // Use store data or fallbacks
  const personalities = store.personalities.length > 0 ? store.personalities : defaultPersonalities;
  const tiers = store.tiers.length > 0 ? store.tiers : defaultTiers;
  const presets = store.presets.length > 0 ? store.presets : defaultPresets;
  const taskTypes = store.taskTypes.length > 0 ? store.taskTypes : defaultTaskTypes;
  const quickTemplates = store.quickTemplates.length > 0 ? store.quickTemplates : defaultQuickTemplates;

  // Convert array to object for templates lookup if needed (though UI handles it)
  // Logic hook handles most logic, we just pass data down
  const logic = useMiowNationLogic();
  const { t, theme, toggleTheme, isDark } = useTheme();
  const { isEnabled, openSettings } = useFeatureToggle();

  // Extract logic props for cleaner passing
  const {
    inputPrompt,
    setInputPrompt,
    improvedPrompt,
    analysis,
    activeTab,
    setActiveTab,
    fileInputRef,
    settings,
    setSettings,
    examples,
    newExample,
    setNewExample,
    variables,
    newVariable,
    setNewVariable,
    savedPrompts,
    setSavedPrompts,
    promptName,
    setPromptName,
    savedSearch,
    setSavedSearch,
    serializeState,
    deserializeState, // unused here but part of logic
    loadPresetMode,
    loadQuickTemplate,
    addExample,
    removeExample,
    addVariable,
    removeVariable,
    // toggleFocus, toggleConstraint are used inside MainContent via logic props? 
    // Wait, MainContent imported them from constants? No, logic has them.
    // Let's check MainContent props... 
    // MainContent imports toggleFocus/Constraint from constants? NO.
    // Logic hook returns them.
    // I need to ensure MainContent receives them or the logic object.

    // Logic hook spread:
    ...logicRest
  } = logic;

  const [expandedSidebar, setExpandedSidebar] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Memoized stats
  const stats = useMemo(
    () => [
      {
        label: "Quality Score",
        value: analysis?.score || "0",
        trend: analysis ? (analysis.score > 70 ? "+15%" : "+8%") : null,
      },
      {
        label: "Features",
        value: analysis?.features.length || "0",
      },
      {
        label: "Words",
        value: analysis?.wordCount || "0",
      },
      {
        label: "Saved",
        value: savedPrompts.length,
      },
    ],
    [analysis, savedPrompts]
  );

  // Build tab list based on feature toggles
  const tabs = useMemo(() => {
    const allTabs = [
      { id: "builder", label: "Builder", icon: Layers, always: true },
      { id: "playground", label: "Playground", icon: Play, always: true },
      { id: "explore", label: "Explore", icon: Compass, always: true },
      { id: "presets", label: "Presets", icon: Cpu, feature: "showPresetsTab" },
      { id: "templates", label: "Templates", icon: Sparkles, feature: "showTemplatesTab" },
      { id: "net", label: "NET", icon: Brain, feature: "showNETFrameworkTab" },
      { id: "architect", label: "Architect", icon: Target, always: true },
      { id: "guide", label: "Guide", icon: Book, feature: "showGuideTab" },
    ];
    return allTabs.filter(tab => tab.always || isEnabled(tab.feature));
  }, [isEnabled]);

  const handleAdoptTemplate = (template) => {
    setInputPrompt(template.prompt);
    setActiveTab("builder");
    // require toast here? Or move logic to simple function?
    // Toast is global now via AppLayout, need to import toast if we use it here.
    // Or pass a callback.
    // Let's import toast.
    import('react-hot-toast').then(mod => mod.default.success(`Adopted "${template.title}" template!`, { icon: '✨' }));
  };

  return (
    <AppLayout
      t={t}
      theme={theme}
      isDark={isDark}
      toggleTheme={toggleTheme}
      isEnabled={isEnabled}
      openSettings={openSettings}
      setSettings={setSettings}
      resetAll={logic.resetAll}
      serializeState={serializeState}
      showAnalytics={showAnalytics}
      setShowAnalytics={setShowAnalytics}
      stats={stats}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <MainContent
        activeTab={activeTab}
        isEnabled={isEnabled}
        t={t}
        isDark={isDark}
        netFramework={netFramework}
        presets={presets}
        loadPresetMode={loadPresetMode}
        quickTemplates={quickTemplates}
        loadQuickTemplate={loadQuickTemplate}
        tiers={tiers}

        // Data
        improvedPrompt={improvedPrompt}
        inputPrompt={inputPrompt}
        setInputPrompt={setInputPrompt}
        handleAdoptTemplate={handleAdoptTemplate}
        settings={settings}
        setSettings={setSettings}
        savedPrompts={savedPrompts}
        savedSearch={savedSearch}
        setSavedSearch={setSavedSearch}
        savePrompt={logic.savePrompt}
        loadPrompt={logic.loadPrompt}
        deletePrompt={logic.deletePrompt}
        promptName={promptName}
        setPromptName={setPromptName}
        improvePrompt={logic.improvePrompt}
        fileInputRef={fileInputRef}
        importPrompt={logic.importPrompt}
        exportPrompt={logic.exportPrompt}
        newExample={newExample}
        setNewExample={setNewExample}
        addExample={addExample}
        removeExample={removeExample}
        examples={examples}
        newVariable={newVariable}
        setNewVariable={setNewVariable}
        addVariable={addVariable}
        removeVariable={removeVariable}
        variables={variables}
        analysis={analysis}
        expandedSidebar={expandedSidebar}
        setExpandedSidebar={setExpandedSidebar}
      />
    </AppLayout>
  );
};

// Main MiowNation Component with Providers
const MiowNation = () => {
  return (
    <ThemeProvider>
      <FeatureToggleProvider>
        <MiowNationInner />
      </FeatureToggleProvider>
    </ThemeProvider>
  );
};

export default MiowNation;