import React, { useState, useRef, useEffect, useMemo } from "react";
import toast, { Toaster } from 'react-hot-toast';
import {
  Lightbulb,
  Zap,
  CheckCircle,
  AlertCircle,
  Settings,
  Plus,
  X,
  Copy,
  Link2,
  Download,
  Upload,
  Trash2,
  Save,
  Book,
  Layers,
  Target,
  Wand2,
  Sparkles,
  Brain,
  Eye,
  Users,
  Cpu,
  Moon,
  Sun,
  Clock,
  TrendingUp,
  GitBranch,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Info,
  Settings2,
  Lightbulb as LightbulbIcon,
  Zap as ZapIcon,
} from "lucide-react";
import {
  interestModes,
  personalities,
  perspectiveModes,
  presetModes,
  reasoningTemplates,
  rolePresets,
  taskTypes,
  techniquesByTier,
  tiers,
  tones,
  focusOptions,
  constraintOptions,
  quickTemplates,
  netFramework,
} from "./constants";
import { useMiowNationLogic } from "./hooks";
import {
  Tooltip,
  AnimatedCard,
  ProgressBar,
  Badge,
  CollapsibleSection,
  StatsWidget,
  SettingsPanel,
} from "./components/common";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { FeatureToggleProvider, useFeatureToggle } from "./contexts/FeatureToggleContext";

// NET Framework Visualizer
const NETFrameworkVisualizer = ({ theme: t }) => {
  const [expandedLayer, setExpandedLayer] = useState(0);

  return (
    <div className={`${t.card} rounded-xl border ${t.border} p-6`}>
      <h3 className={`font-semibold text-lg mb-4 flex items-center gap-2 ${t.text}`}>
        <Brain className="w-5 h-5 text-blue-500" />
        NET Framework Architecture
      </h3>
      <div className="space-y-2">
        {Object.entries(netFramework.components).map(([key, layer], idx) => (
          <div
            key={key}
            className={`
              border-l-2 pl-4 py-3 cursor-pointer transition-all duration-200 rounded-r-lg
              ${expandedLayer === idx
                ? `border-l-blue-500 ${t.cardActive}`
                : `border-l-slate-600 ${t.cardHover}`
              }
            `}
            onClick={() => setExpandedLayer(expandedLayer === idx ? -1 : idx)}
          >
            <div className={`font-medium text-sm flex items-center justify-between ${t.text}`}>
              {layer.name}
              {expandedLayer === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
            {expandedLayer === idx && (
              <div className={`mt-3 text-xs ${t.textSecondary} space-y-2`}>
                <p className="mb-2">{layer.description}</p>
                <div className="flex flex-wrap gap-2">
                  {layer.techniques.map((tech, i) => (
                    <Badge key={i} text={tech} variant="info" size="sm" />
                  ))}
                </div>
                <p className="text-blue-500 mt-2 font-medium">→ {layer.purpose}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Main MiowNation Component (Inner)
const MiowNationInner = () => {
  const logic = useMiowNationLogic();
  const { t, theme, toggleTheme, isDark } = useTheme();
  const { isEnabled, openSettings } = useFeatureToggle();

  const {
    inputPrompt,
    setInputPrompt,
    improvedPrompt,
    setImprovedPrompt,
    analysis,
    activeTab,
    setActiveTab,
    fileInputRef,
    settings,
    setSettings,
    examples,
    setExamples,
    newExample,
    setNewExample,
    variables,
    setVariables,
    newVariable,
    setNewVariable,
    customCategories,
    setCustomCategories,
    newCategory,
    setNewCategory,
    savedPrompts,
    setSavedPrompts,
    promptName,
    setPromptName,
    promptTags,
    setPromptTags,
    savedSearch,
    setSavedSearch,
    serializeState,
    deserializeState,
    loadPresetMode,
    generatePromptByTechnique,
    improvePrompt,
    loadQuickTemplate,
    addExample,
    removeExample,
    addVariable,
    removeVariable,
    addCategory,
    removeCategory,
    toggleFocus,
    toggleConstraint,
    savePrompt,
    loadPrompt,
    deletePrompt,
    exportPrompt,
    importPrompt,
    resetAll,
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
      { id: "presets", label: "Presets", icon: Cpu, feature: "showPresetsTab" },
      { id: "templates", label: "Templates", icon: Sparkles, feature: "showTemplatesTab" },
      { id: "net", label: "NET", icon: Brain, feature: "showNETFrameworkTab" },
      { id: "guide", label: "Guide", icon: Book, feature: "showGuideTab" },
    ];
    return allTabs.filter(tab => tab.always || isEnabled(tab.feature));
  }, [isEnabled]);

  return (
    <>
      {/* Toast Container */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: isDark ? '#1e293b' : '#ffffff',
            color: isDark ? '#f1f5f9' : '#0f172a',
            padding: '14px 18px',
            borderRadius: '12px',
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            fontSize: '14px',
            fontWeight: '500',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      {/* Settings Panel */}
      <SettingsPanel onSettingsReset={(resetSettings) => setSettings(prev => ({ ...prev, ...resetSettings }))} />

      <div className={`min-h-screen transition-colors duration-200 ${t.bgGradient} ${t.text}`}>
        {/* Subtle Background Effect */}
        {isEnabled('showBackgroundEffects') && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className={`
              absolute top-0 right-0 w-[600px] h-[600px] 
              bg-blue-500/5 rounded-full blur-3xl
            `} />
            <div className={`
              absolute bottom-0 left-0 w-[500px] h-[500px] 
              bg-indigo-500/5 rounded-full blur-3xl
            `} />
          </div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8 animate-slide-up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="p-2.5 sm:p-3 bg-blue-600 rounded-xl flex-shrink-0">
                  <Wand2 className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${t.text}`}>
                    MiowNation
                  </h1>
                  <p className={`text-xs sm:text-sm ${t.textSecondary}`}>
                    Advanced Prompt Engineering Studio
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={toggleTheme}
                  className={`p-2.5 rounded-xl btn-touch transition-all duration-200 ${t.button}`}
                  title="Toggle theme"
                  aria-label="Toggle theme"
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                {isEnabled('showAnalyticsWidget') && (
                  <button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className={`p-2.5 rounded-xl btn-touch transition-all duration-200 ${showAnalytics ? t.buttonActive : t.button}`}
                    title="Toggle analytics"
                    aria-label="Toggle analytics"
                  >
                    <TrendingUp className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={openSettings}
                  className={`p-2.5 rounded-xl btn-touch transition-all duration-200 ${t.button}`}
                  title="Settings"
                  aria-label="Open settings"
                >
                  <Settings2 className="w-5 h-5" />
                </button>
                <button
                  onClick={resetAll}
                  className={`px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 ${t.button}`}
                  title="Reset all settings"
                >
                  <span className="hidden sm:inline">Reset</span>
                  <span className="sm:hidden">↺</span>
                </button>
                <button
                  onClick={() => {
                    const hash = serializeState();
                    navigator.clipboard.writeText(`${location.origin}${location.pathname}#p=${hash}`);
                    toast.success('Shareable URL copied!', { icon: <Link2 className="w-4 h-4 text-blue-500" /> });
                  }}
                  className={`px-3 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${t.accent} ${t.accentHover}`}
                >
                  Share
                </button>
              </div>
            </div>

            {/* Analytics Bar */}
            {showAnalytics && isEnabled('showAnalyticsWidget') && (
              <div className="mb-6 animate-slide-up">
                <StatsWidget stats={stats} theme={t} />
              </div>
            )}

            {/* Tabs */}
            <div className={`
              flex gap-1 p-1 rounded-xl border ${t.border} ${t.card} 
              overflow-x-auto scrollbar-hide
            `}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg 
                      text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap
                      ${activeTab === tab.id
                        ? `${t.buttonActive}`
                        : `${t.tabInactive}`
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden text-[10px] font-semibold">{tab.label.slice(0, 3).toUpperCase()}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* NET Framework Tab */}
          {activeTab === "net" && isEnabled('showNETFrameworkTab') && (
            <div className="space-y-6">
              <NETFrameworkVisualizer theme={t} />

              <div className={`${t.card} rounded-xl border ${t.border} p-4 sm:p-6`}>
                <h3 className={`font-semibold text-lg mb-4 ${t.text}`}>Decision Matrix</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(netFramework.decisionMatrix).map(([task, config]) => (
                    <div key={task} className={`border ${t.border} rounded-xl p-4 ${t.cardHover} transition-colors`}>
                      <h4 className={`font-medium mb-2 capitalize ${t.text}`}>{task.replace(/_/g, " ")}</h4>
                      <div className="flex flex-wrap gap-2">
                        {config.techniques.map((tech, i) => (
                          <Badge key={i} text={tech} variant="success" size="sm" />
                        ))}
                      </div>
                      <div className="mt-3 text-sm text-emerald-500 font-medium">
                        Expected: {config.expectedPerformance}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Presets Tab */}
          {activeTab === "presets" && isEnabled('showPresetsTab') && (
            <AnimatedCard className={`${t.card} rounded-xl border ${t.border} p-4 sm:p-6`}>
              <h2 className={`text-xl font-semibold mb-2 flex items-center gap-2 ${t.text}`}>
                <Cpu className="w-5 h-5 text-blue-500" />
                Quick Start Presets
              </h2>
              <p className={`${t.textSecondary} text-sm mb-6`}>
                Pre-configured modes optimized for specific use cases
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presetModes.map((mode) => (
                  <div
                    key={mode.id}
                    className={`
                      border ${t.border} rounded-xl p-4 transition-all duration-200 
                      ${t.cardHover} hover:border-blue-500/30
                    `}
                  >
                    <h3 className={`font-medium mb-2 ${t.text}`}>{mode.name}</h3>
                    <p className={`text-sm ${t.textSecondary} mb-3 min-h-10`}>{mode.desc}</p>
                    {mode.config.performanceGain && (
                      <Badge
                        text={mode.config.performanceGain}
                        variant="success"
                        icon={TrendingUp}
                        size="sm"
                      />
                    )}
                    <button
                      onClick={() => loadPresetMode(mode.id)}
                      className={`w-full mt-4 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${t.cta} ${t.ctaHover}`}
                    >
                      Load Preset
                    </button>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          )}

          {/* Templates Tab */}
          {activeTab === "templates" && isEnabled('showTemplatesTab') && (
            <AnimatedCard className={`${t.card} rounded-xl border ${t.border} p-4 sm:p-6`}>
              <h2 className={`text-xl font-semibold mb-2 flex items-center gap-2 ${t.text}`}>
                <Sparkles className="w-5 h-5 text-blue-500" />
                Quick Templates
              </h2>
              <p className={`${t.textSecondary} text-sm mb-6`}>
                Proven prompt structures and reasoning patterns
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickTemplates.map((template, i) => (
                  <div
                    key={i}
                    className={`
                      border ${t.border} rounded-xl p-4 transition-all duration-200 
                      ${t.cardHover} hover:border-blue-500/30
                    `}
                  >
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <h3 className={`font-medium flex-1 text-sm sm:text-base ${t.text}`}>{template.name}</h3>
                      <Badge text={template.category} variant="info" size="sm" />
                    </div>
                    <p className={`text-xs font-mono ${t.textSecondary} mb-3 line-clamp-3`}>
                      {template.template}
                    </p>
                    <button
                      onClick={() => loadQuickTemplate(template.template)}
                      className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${t.cta} ${t.ctaHover}`}
                    >
                      Load Template
                    </button>
                  </div>
                ))}
              </div>
            </AnimatedCard>
          )}

          {/* Guide Tab */}
          {activeTab === "guide" && isEnabled('showGuideTab') && (
            <AnimatedCard className={`${t.card} ${t.scrollbar} rounded-xl border ${t.border} p-4 sm:p-6 max-h-[70vh] overflow-y-auto`}>
              <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${t.text}`}>
                <Book className="w-5 h-5 text-blue-500" />
                Prompt Engineering Guide
              </h2>

              {tiers.map((tier) => (
                <CollapsibleSection
                  key={tier.id}
                  title={`${tier.label} - ${tier.desc}`}
                  icon={Target}
                  defaultOpen={tier.id === "tier1"}
                  theme={t}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {techniquesByTier[tier.id].map((tech) => (
                      <div
                        key={tech.id}
                        className={`border ${t.border} rounded-lg p-3 transition-colors ${t.cardHover}`}
                      >
                        <div className={`font-medium text-sm mb-1 flex items-center gap-2 ${t.text}`}>
                          <ZapIcon className="w-3 h-3 text-blue-500" />
                          {tech.label}
                        </div>
                        <div className={`text-xs ${t.textSecondary}`}>{tech.desc}</div>
                      </div>
                    ))}
                  </div>
                </CollapsibleSection>
              ))}

              <CollapsibleSection title="Master Principles" icon={LightbulbIcon} defaultOpen={true} theme={t}>
                <ul className={`text-sm ${t.textSecondary} space-y-2`}>
                  <li>• <strong className={t.text}>Clarity:</strong> Be specific and unambiguous</li>
                  <li>• <strong className={t.text}>Structure:</strong> Use XML tags and clear formatting</li>
                  <li>• <strong className={t.text}>Verification:</strong> Request reasoning and evidence</li>
                  <li>• <strong className={t.text}>Examples:</strong> Few-shot learning is powerful</li>
                  <li>• <strong className={t.text}>Iteration:</strong> Systematically refine prompts</li>
                  <li>• <strong className={t.text}>Technique Selection:</strong> Match technique to task type</li>
                  <li>• <strong className={t.text}>Combination:</strong> NET Framework combines techniques intelligently</li>
                </ul>
              </CollapsibleSection>
            </AnimatedCard>
          )}

          {/* Builder Tab */}
          {activeTab === "builder" && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Sidebar */}
              <div
                className={`
                  lg:col-span-1 space-y-3 lg:sticky lg:top-28 lg:self-start
                  max-h-[calc(100vh-200px)] overflow-y-auto pr-2 ${t.scrollbar}
                  transition-all ${!expandedSidebar && "hidden"}
                `}
              >
                {isEnabled('enablePersonality') && (
                  <CollapsibleSection title="Personality" icon={Users} defaultOpen={true} theme={t}>
                    <select
                      value={settings.personality}
                      onChange={(e) => setSettings({ ...settings, personality: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${t.input}`}
                    >
                      {personalities.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.icon} {p.name}
                        </option>
                      ))}
                    </select>
                    {settings.personality !== "none" && (
                      <p className={`text-xs ${t.textMuted} mt-2`}>
                        {personalities.find((p) => p.id === settings.personality)?.desc}
                      </p>
                    )}
                  </CollapsibleSection>
                )}

                {isEnabled('enableTierTechnique') && (
                  <CollapsibleSection title="Tier & Technique" icon={Target} defaultOpen={true} theme={t}>
                    <div className="space-y-1.5">
                      {tiers.map((tier) => (
                        <button
                          key={tier.id}
                          onClick={() =>
                            setSettings({
                              ...settings,
                              tier: tier.id,
                              technique: techniquesByTier[tier.id][0].id,
                            })
                          }
                          className={`
                            w-full p-2.5 rounded-lg text-left text-sm font-medium transition-colors
                            ${settings.tier === tier.id ? t.buttonActive : t.button}
                          `}
                        >
                          {tier.label}
                        </button>
                      ))}
                    </div>

                    <div className="mt-3 space-y-1">
                      {techniquesByTier[settings.tier].map((tech) => (
                        <button
                          key={tech.id}
                          onClick={() => setSettings({ ...settings, technique: tech.id })}
                          className={`
                            w-full p-2 rounded-lg text-left text-sm transition-colors
                            ${settings.technique === tech.id ? t.buttonActive : t.button}
                          `}
                        >
                          {tech.label}
                        </button>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}

                {isEnabled('enableReasoning') && (
                  <CollapsibleSection title="Reasoning" icon={Brain} defaultOpen={false} theme={t}>
                    <label className={`flex items-center text-sm ${t.textSecondary} cursor-pointer`}>
                      <input
                        type="checkbox"
                        checked={settings.reasoningMode}
                        onChange={(e) =>
                          setSettings({ ...settings, reasoningMode: e.target.checked })
                        }
                        className="mr-2 cursor-pointer w-4 h-4 rounded"
                      />
                      Enable Advanced Reasoning
                    </label>
                    {settings.reasoningMode && (
                      <select
                        value={settings.reasoningSteps}
                        onChange={(e) =>
                          setSettings({ ...settings, reasoningSteps: e.target.value })
                        }
                        className={`w-full p-2.5 rounded-lg border text-sm mt-2 transition-colors ${t.input}`}
                      >
                        {Object.entries(reasoningTemplates).map(([key, template]) => (
                          <option key={key} value={key}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </CollapsibleSection>
                )}

                {isEnabled('enablePerspectives') && (
                  <CollapsibleSection title="Perspectives" icon={Eye} defaultOpen={false} theme={t}>
                    <label className={`block text-xs ${t.textSecondary} mb-1`}>Interest Mode</label>
                    <select
                      value={settings.interestMode}
                      onChange={(e) => setSettings({ ...settings, interestMode: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-sm mb-3 transition-colors ${t.input}`}
                    >
                      {interestModes.map((mode) => (
                        <option key={mode.id} value={mode.id}>
                          {mode.label}
                        </option>
                      ))}
                    </select>

                    <label className={`block text-xs ${t.textSecondary} mb-1`}>Expert Level</label>
                    <select
                      value={settings.perspectiveMode}
                      onChange={(e) => setSettings({ ...settings, perspectiveMode: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${t.input}`}
                    >
                      {perspectiveModes.map((mode) => (
                        <option key={mode.id} value={mode.id}>
                          {mode.label}
                        </option>
                      ))}
                    </select>
                  </CollapsibleSection>
                )}

                {isEnabled('enableTaskRole') && (
                  <CollapsibleSection title="Task & Role" icon={Settings} defaultOpen={false} theme={t}>
                    <label className={`block text-xs ${t.textSecondary} mb-1`}>Task Type</label>
                    <select
                      value={settings.taskType}
                      onChange={(e) => setSettings({ ...settings, taskType: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-sm mb-3 transition-colors ${t.input}`}
                    >
                      {taskTypes.map((tt) => (
                        <option key={tt.value} value={tt.value}>
                          {tt.label}
                        </option>
                      ))}
                    </select>

                    <label className={`block text-xs ${t.textSecondary} mb-1`}>Custom Role</label>
                    <input
                      type="text"
                      value={settings.roleAssignment}
                      onChange={(e) => setSettings({ ...settings, roleAssignment: e.target.value })}
                      placeholder={rolePresets[settings.taskType]}
                      className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${t.input}`}
                    />
                  </CollapsibleSection>
                )}

                {isEnabled('enableTuning') && (
                  <CollapsibleSection title="Tuning" icon={Zap} defaultOpen={false} theme={t}>
                    <label className={`block text-xs ${t.textSecondary} mb-1`}>IQ Level: {settings.iqLevel}</label>
                    <input
                      type="range"
                      value={settings.iqLevel}
                      onChange={(e) => setSettings({ ...settings, iqLevel: parseInt(e.target.value) })}
                      min="100"
                      max="180"
                      className="w-full mb-3"
                    />

                    <label className={`block text-xs ${t.textSecondary} mb-1`}>Tone</label>
                    <select
                      value={settings.tone}
                      onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-sm mb-3 transition-colors ${t.input}`}
                    >
                      {tones.map((tone) => (
                        <option key={tone} value={tone}>
                          {tone}
                        </option>
                      ))}
                    </select>

                    <label className={`block text-xs ${t.textSecondary} mb-1`}>Language</label>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${t.input}`}
                    >
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Hindi">Hindi</option>
                    </select>
                  </CollapsibleSection>
                )}

                {isEnabled('enableFocusConstraints') && (
                  <CollapsibleSection title="Focus & Constraints" icon={Target} defaultOpen={false} theme={t}>
                    <div className="space-y-2 mb-3">
                      {focusOptions.slice(0, 4).map((f) => (
                        <label key={f} className={`flex items-center text-sm ${t.textSecondary} cursor-pointer`}>
                          <input
                            type="checkbox"
                            checked={settings.focusAreas.includes(f)}
                            onChange={() => toggleFocus(f)}
                            className="mr-2 cursor-pointer w-4 h-4 rounded"
                          />
                          {f}
                        </label>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {constraintOptions.slice(0, 4).map((c) => (
                        <label key={c} className={`flex items-center text-sm ${t.textSecondary} cursor-pointer`}>
                          <input
                            type="checkbox"
                            checked={settings.constraints.includes(c)}
                            onChange={() => toggleConstraint(c)}
                            className="mr-2 cursor-pointer w-4 h-4 rounded"
                          />
                          {c}
                        </label>
                      ))}
                    </div>
                  </CollapsibleSection>
                )}

                {isEnabled('enableAdvancedSettings') && (
                  <CollapsibleSection title="Advanced Settings" icon={Settings} defaultOpen={false} theme={t}>
                    <label className={`block text-xs ${t.textSecondary} mb-1`}>Output Format</label>
                    <select
                      value={settings.outputFormat}
                      onChange={(e) => setSettings({ ...settings, outputFormat: e.target.value })}
                      className={`w-full p-2.5 rounded-lg border text-sm mb-3 transition-colors ${t.input}`}
                    >
                      <option value="structured">Structured</option>
                      <option value="minimal">Minimal</option>
                      <option value="detailed">Detailed</option>
                    </select>

                    {settings.technique === "fewshot" && (
                      <>
                        <label className={`block text-xs ${t.textSecondary} mb-1`}>
                          Example Count: {settings.exampleCount}
                        </label>
                        <input
                          type="range"
                          value={settings.exampleCount}
                          onChange={(e) => setSettings({ ...settings, exampleCount: parseInt(e.target.value) })}
                          min="1"
                          max="5"
                          className="w-full mb-3"
                        />
                      </>
                    )}

                    <label className={`block text-xs ${t.textSecondary} mb-1`}>Max Tokens (optional)</label>
                    <input
                      type="number"
                      value={settings.maxTokens}
                      onChange={(e) => setSettings({ ...settings, maxTokens: e.target.value })}
                      placeholder="e.g., 2000"
                      className={`w-full p-2.5 rounded-lg border text-sm mb-3 transition-colors ${t.input}`}
                    />

                    <label className={`block text-xs ${t.textSecondary} mb-1`}>Target Length (words)</label>
                    <input
                      type="number"
                      value={settings.lengthTarget}
                      onChange={(e) => setSettings({ ...settings, lengthTarget: e.target.value })}
                      placeholder="e.g., 500"
                      className={`w-full p-2.5 rounded-lg border text-sm mb-3 transition-colors ${t.input}`}
                    />

                    <label className={`block text-xs ${t.textSecondary} mb-1`}>Prefill Response (optional)</label>
                    <textarea
                      value={settings.prefillResponse}
                      onChange={(e) => setSettings({ ...settings, prefillResponse: e.target.value })}
                      placeholder="Start the assistant's response..."
                      className={`w-full p-2.5 rounded-lg border text-sm resize-none h-16 transition-colors ${t.input}`}
                    />
                  </CollapsibleSection>
                )}

                {isEnabled('showSavedPromptsSection') && (
                  <CollapsibleSection title="Saved Prompts" icon={Save} defaultOpen={false} theme={t}>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={promptName}
                        onChange={(e) => setPromptName(e.target.value)}
                        placeholder="Name..."
                        className={`flex-1 p-2.5 rounded-lg border text-sm transition-colors ${t.input}`}
                      />
                      <button
                        onClick={savePrompt}
                        className={`p-2.5 rounded-lg btn-touch transition-colors ${t.button}`}
                        aria-label="Save prompt"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={savedSearch}
                      onChange={(e) => setSavedSearch(e.target.value)}
                      placeholder="Search..."
                      className={`w-full p-2.5 rounded-lg border text-sm mb-2 transition-colors ${t.input}`}
                    />
                    <div className={`space-y-1 max-h-48 overflow-y-auto ${t.scrollbar}`}>
                      {savedPrompts
                        .filter((p) => {
                          if (!savedSearch.trim()) return true;
                          const q = savedSearch.toLowerCase();
                          return (
                            p.name.toLowerCase().includes(q) ||
                            (p.tags || []).some((tag) => tag.toLowerCase().includes(q))
                          );
                        })
                        .map((saved) => (
                          <div
                            key={saved.id}
                            className={`
                              flex items-center justify-between p-2.5 rounded-lg 
                              border text-xs ${t.border} ${t.listItemHover} transition-colors
                            `}
                          >
                            <div className="flex-1 min-w-0">
                              <div className={`font-medium truncate ${t.text}`}>{saved.name}</div>
                              <div className={`${t.textMuted} text-xs`}>{saved.timestamp}</div>
                            </div>
                            <div className="flex gap-1 flex-shrink-0">
                              <button
                                onClick={() => loadPrompt(saved)}
                                className={`px-2 py-1 rounded text-xs transition-colors ${t.button}`}
                              >
                                Load
                              </button>
                              <button
                                onClick={() => deletePrompt(saved.id)}
                                className="text-red-500 hover:text-red-400 transition-colors p-1"
                                aria-label={`Delete saved prompt ${saved.name}`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CollapsibleSection>
                )}
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-4">
                <button
                  onClick={() => setExpandedSidebar(!expandedSidebar)}
                  className={`lg:hidden p-2.5 rounded-lg btn-touch ${t.button}`}
                  aria-label={expandedSidebar ? "Collapse sidebar" : "Expand sidebar"}
                >
                  {expandedSidebar ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Input Prompt */}
                <AnimatedCard className={`${t.card} rounded-xl border ${t.border} p-4`}>
                  <h3 className={`font-medium mb-3 text-sm flex items-center ${t.text}`}>
                    <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
                    Your Prompt
                  </h3>
                  <textarea
                    value={inputPrompt}
                    onChange={(e) => setInputPrompt(e.target.value)}
                    placeholder="Enter your base prompt here..."
                    className={`w-full p-3 rounded-lg border resize-none font-mono text-sm h-32 transition-colors ${t.input}`}
                  />
                  {inputPrompt && (
                    <div className="mt-2 flex items-center gap-3 text-xs">
                      <span className={t.textSecondary}>{inputPrompt.length} characters</span>
                      <div className="flex-1">
                        <ProgressBar value={Math.min(inputPrompt.length, 500)} max={500} size="xs" />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <button
                      onClick={improvePrompt}
                      disabled={!inputPrompt.trim()}
                      className={`
                        flex-1 min-w-[150px] py-2.5 px-4 rounded-lg font-medium 
                        flex items-center justify-center transition-colors 
                        disabled:opacity-50 disabled:cursor-not-allowed 
                        ${t.cta} ${t.ctaHover}
                      `}
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Optimized Prompt
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={importPrompt}
                      accept=".json"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`p-2.5 rounded-lg btn-touch transition-colors ${t.button}`}
                      title="Import prompt"
                      aria-label="Import prompt"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                </AnimatedCard>

                {/* Custom Instructions */}
                {isEnabled('enableCustomInstructions') && (
                  <AnimatedCard className={`${t.card} rounded-xl border ${t.border} p-4`}>
                    <h3 className={`font-medium mb-3 text-sm ${t.text}`}>Custom Instructions</h3>
                    <textarea
                      value={settings.customInstructions}
                      onChange={(e) =>
                        setSettings({ ...settings, customInstructions: e.target.value })
                      }
                      placeholder="Add any additional custom instructions here..."
                      className={`w-full p-3 rounded-lg border resize-none text-sm h-20 transition-colors ${t.input}`}
                    />
                  </AnimatedCard>
                )}

                {/* Few-Shot Examples */}
                {settings.technique === "fewshot" && isEnabled('enableFewShot') && (
                  <AnimatedCard className={`${t.card} rounded-xl border ${t.border} p-4`}>
                    <h3 className={`font-medium mb-3 text-sm ${t.text}`}>Few-Shot Examples</h3>
                    <div className="space-y-2 mb-3">
                      <input
                        type="text"
                        value={newExample.input}
                        onChange={(e) =>
                          setNewExample({ ...newExample, input: e.target.value })
                        }
                        placeholder="Input example..."
                        className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${t.input}`}
                      />
                      <input
                        type="text"
                        value={newExample.output}
                        onChange={(e) =>
                          setNewExample({ ...newExample, output: e.target.value })
                        }
                        placeholder="Output example..."
                        className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${t.input}`}
                      />
                      <button
                        onClick={addExample}
                        className={`w-full p-2.5 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${t.accent} ${t.accentHover}`}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Example
                      </button>
                    </div>
                    <div className={`space-y-2 max-h-48 overflow-y-auto ${t.scrollbar}`}>
                      {examples.map((ex, i) => (
                        <div key={i} className={`p-3 rounded-lg border text-sm ${t.border} ${t.cardHover}`}>
                          <div className={t.text}>
                            <strong>In:</strong> {ex.input}
                          </div>
                          <div className={t.text}>
                            <strong>Out:</strong> {ex.output}
                          </div>
                          <button
                            onClick={() => removeExample(i)}
                            className="text-red-500 text-xs mt-1 hover:text-red-400 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </AnimatedCard>
                )}

                {/* Variables */}
                {settings.technique === "variables" && isEnabled('enableVariables') && (
                  <AnimatedCard className={`${t.card} rounded-xl border ${t.border} p-4`}>
                    <h3 className={`font-medium mb-3 text-sm ${t.text}`}>Variables</h3>
                    <div className="space-y-2 mb-3">
                      <input
                        type="text"
                        value={newVariable.name}
                        onChange={(e) =>
                          setNewVariable({ ...newVariable, name: e.target.value })
                        }
                        placeholder="Variable name..."
                        className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${t.input}`}
                      />
                      <input
                        type="text"
                        value={newVariable.description}
                        onChange={(e) =>
                          setNewVariable({ ...newVariable, description: e.target.value })
                        }
                        placeholder="Variable description..."
                        className={`w-full p-2.5 rounded-lg border text-sm transition-colors ${t.input}`}
                      />
                      <button
                        onClick={addVariable}
                        className={`w-full p-2.5 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${t.accent} ${t.accentHover}`}
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Variable
                      </button>
                    </div>
                    <div className={`space-y-2 max-h-32 overflow-y-auto ${t.scrollbar}`}>
                      {variables.map((v, i) => (
                        <div key={i} className={`p-3 rounded-lg border text-sm ${t.border} ${t.cardHover}`}>
                          <div className={t.text}>
                            <strong>{`{${v.name}}`}:</strong> {v.description}
                          </div>
                          <button
                            onClick={() => removeVariable(i)}
                            className="text-red-500 text-xs mt-1 hover:text-red-400 transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </AnimatedCard>
                )}

                {/* Analysis */}
                {analysis && (
                  <AnimatedCard className={`${t.card} rounded-xl border ${t.border} p-4`}>
                    <h3 className={`font-medium mb-4 text-sm flex items-center ${t.text}`}>
                      <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                      Analysis & Metrics
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className={`p-3 rounded-lg border ${t.border}`}>
                        <div className={`text-xs ${t.textSecondary}`}>Quality Score</div>
                        <div className={`text-2xl font-bold ${t.text}`}>{analysis.score}%</div>
                        <ProgressBar value={analysis.score} size="xs" />
                      </div>
                      <div className={`p-3 rounded-lg border ${t.border}`}>
                        <div className={`text-xs ${t.textSecondary}`}>Features</div>
                        <div className={`text-2xl font-bold ${t.text}`}>{analysis.features.length}</div>
                      </div>
                      <div className={`p-3 rounded-lg border ${t.border}`}>
                        <div className={`text-xs ${t.textSecondary}`}>Words</div>
                        <div className={`text-2xl font-bold ${t.text}`}>{analysis.wordCount}</div>
                      </div>
                      <div className={`p-3 rounded-lg border ${t.border}`}>
                        <div className={`text-xs ${t.textSecondary}`}>Characters</div>
                        <div className={`text-2xl font-bold ${t.text}`}>{analysis.characterCount}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className={`font-medium text-sm ${t.textSecondary} mb-2`}>Active Features:</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.features.map((f, i) => (
                          <Badge key={i} text={f} variant="success" size="sm" />
                        ))}
                      </div>
                    </div>

                    {/* Quality Score & Suggestions */}
                    {analysis.qualityScore !== undefined && (
                      <div className={`mt-4 pt-4 border-t ${t.divider}`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className={`font-medium text-sm ${t.textSecondary}`}>AI Quality Assessment:</h4>
                          <span className={`text-lg font-bold ${analysis.qualityScore >= 80 ? 'text-emerald-500' : analysis.qualityScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                            {analysis.qualityScore}%
                          </span>
                        </div>
                        <ProgressBar value={analysis.qualityScore} size="sm" />

                        {analysis.suggestions && analysis.suggestions.length > 0 && (
                          <div className="mt-3">
                            <h5 className={`text-xs font-medium ${t.textSecondary} mb-2`}>Optimization Suggestions:</h5>
                            <div className="space-y-1">
                              {analysis.suggestions.map((suggestion, i) => (
                                <div key={i} className={`text-xs ${t.text} p-2 rounded-lg ${t.cardHover}`}>
                                  {suggestion}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </AnimatedCard>
                )}

                {/* Improved Prompt */}
                {improvedPrompt && (
                  <AnimatedCard className={`${t.card} rounded-xl border ${t.border} p-4`}>
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <h3 className={`font-medium text-sm flex items-center ${t.text}`}>
                        <Zap className="w-4 h-4 mr-2 text-blue-500" />
                        Optimized Prompt
                      </h3>
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(improvedPrompt);
                            toast.success('Copied to clipboard!', { icon: <CheckCircle className="w-4 h-4 text-emerald-500" /> });
                          }}
                          className={`py-2 px-4 rounded-lg text-sm font-medium flex items-center transition-colors ${t.button}`}
                        >
                          <Copy className="w-4 h-4 mr-1" /> Copy
                        </button>
                        <div className="relative group">
                          <button className={`py-2 px-4 rounded-lg text-sm font-medium flex items-center transition-colors ${t.button}`}>
                            <Download className="w-4 h-4 mr-1" /> Export
                          </button>
                          <div className={`absolute right-0 mt-1 hidden group-hover:block ${t.cardSolid} border ${t.border} rounded-lg shadow-lg z-10`}>
                            <button
                              onClick={() => exportPrompt("json")}
                              className={`block w-full text-left px-4 py-2 text-sm rounded-t-lg transition-colors ${t.cardHover}`}
                            >
                              JSON
                            </button>
                            <button
                              onClick={() => exportPrompt("md")}
                              className={`block w-full text-left px-4 py-2 text-sm transition-colors ${t.cardHover}`}
                            >
                              Markdown
                            </button>
                            <button
                              onClick={() => exportPrompt("txt")}
                              className={`block w-full text-left px-4 py-2 text-sm rounded-b-lg transition-colors ${t.cardHover}`}
                            >
                              Plain Text
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`
                        rounded-lg p-4 border max-h-96 overflow-y-auto ${t.scrollbar}
                        ${t.border} ${isDark ? "bg-slate-950" : "bg-slate-50"}
                      `}
                    >
                      <pre className={`whitespace-pre-wrap font-mono text-xs ${t.text}`}>{improvedPrompt}</pre>
                    </div>
                  </AnimatedCard>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
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
