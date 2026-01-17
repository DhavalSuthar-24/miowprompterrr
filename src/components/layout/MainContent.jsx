import React, { Suspense, lazy } from "react";
import {
    Brain,
    Cpu,
    Sparkles,
    Book,
    Target,
    Zap as ZapIcon,
    Zap,
    Lightbulb as LightbulbIcon,
    Users,
    Settings,
    Save,
    Trash2,
    Copy,
    Download,
    Upload,
    Plus,
    CheckCircle,
    AlertCircle,
    Minimize2,
    Maximize2,
    X,
    GitBranch,
    History,
    Loader2
} from "lucide-react";
import toast from 'react-hot-toast';

import {
    AnimatedCard,
    Badge,
    CollapsibleSection,
    ProgressBar
} from "../common";

const PromptLibrary = lazy(() => import("../library/PromptLibrary").then(m => ({ default: m.PromptLibrary })));
const PlaygroundConsole = lazy(() => import("../playground/PlaygroundConsole").then(m => ({ default: m.PlaygroundConsole })));
const ArchitectPage = lazy(() => import("../../pages/ArchitectPage").then(m => ({ default: m.ArchitectPage })));
const NETFrameworkVisualizer = lazy(() => import("../net/NETFrameworkVisualizer").then(m => ({ default: m.NETFrameworkVisualizer })));
const MagicRefineButton = lazy(() => import("../builder/MagicRefineButton").then(m => ({ default: m.MagicRefineButton })));

import {
    interestModes,
    personalities,
    perspectiveModes,
    reasoningTemplates,
    rolePresets,
    taskTypes,
    techniquesByTier,
    tones,
    focusOptions,
    constraintOptions,
} from "../../constants";

export const MainContent = ({
    activeTab,
    isEnabled,
    t,
    isDark,
    netFramework,
    presets,
    loadPresetMode,
    quickTemplates,
    loadQuickTemplate,
    tiers,

    // Logic Props
    improvedPrompt,
    inputPrompt,
    setInputPrompt,
    handleAdoptTemplate,
    settings,
    setSettings,
    savedPrompts,
    savedSearch,
    setSavedSearch,
    savePrompt,
    loadPrompt,
    deletePrompt,
    promptName,
    setPromptName,
    improvePrompt,
    fileInputRef,
    importPrompt,
    exportPrompt,
    newExample,
    setNewExample,
    addExample,
    removeExample,
    examples,
    newVariable,
    setNewVariable,
    addVariable,
    removeVariable,
    variables,
    analysis,
    expandedSidebar,
    setExpandedSidebar
}) => {

    return (
        <>
            {/* NET Framework Tab */}
            {activeTab === "net" && isEnabled('showNETFrameworkTab') && (
                <div className="space-y-6">
                    <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
                        <NETFrameworkVisualizer theme={t} />
                    </Suspense>

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
                        {presets.map((mode) => (
                            <div
                                key={mode.id}
                                className={`
                  border ${t.border} rounded-xl p-4 transition-all duration-200 
                  ${t.cardHover} hover:border-blue-500/30
                `}
                            >
                                <h3 className={`font-medium mb-2 ${t.text}`}>{mode.name}</h3>
                                <p className={`text-sm ${t.textSecondary} mb-3 min-h-10`}>{mode.description || mode.desc}</p>
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
                                    className={`w-full mt-4 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${t.accent} ${t.accentHover}`}
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
                                    className={`w-full py-2 px-4 rounded-lg text-sm font-medium transition-colors ${t.accent} ${t.accentHover}`}
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
                <AnimatedCard className={`${t.card} rounded-xl border ${t.border} p-4 sm:p-6 max-h-[70vh] overflow-y-auto`}>
                    <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${t.text}`}>
                        <Book className="w-5 h-5 text-blue-500" />
                        Prompt Engineering Guide
                    </h2>

                    {tiers.map((tier) => (
                        <CollapsibleSection
                            key={tier.id}
                            title={`${tier.label} - ${tier.description || tier.desc}`}
                            icon={Target}
                            defaultOpen={tier.id === "tier1"}
                            theme={t}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {(tier.techniques || techniquesByTier[tier.id] || []).map((tech) => (
                                    <div
                                        key={tech.id}
                                        className={`border ${t.border} rounded-lg p-3 transition-colors ${t.cardHover}`}
                                    >
                                        <div className={`font-medium text-sm mb-1 flex items-center gap-2 ${t.text}`}>
                                            <ZapIcon className="w-3 h-3 text-blue-500" />
                                            {tech.label}
                                        </div>
                                        <div className={`text-xs ${t.textSecondary}`}>{tech.description || tech.desc}</div>
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

            {/* Playground Tab */}
            {activeTab === "playground" && (
                <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
                    <PlaygroundConsole initialPrompt={improvedPrompt || inputPrompt} theme={t} />
                </Suspense>
            )}

            {/* Explore Tab */}
            {activeTab === "explore" && (
                <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
                    <PromptLibrary onAdopt={handleAdoptTemplate} theme={t} />
                </Suspense>
            )}

            {/* Architect Tab */}
            {activeTab === "architect" && (
                <Suspense fallback={<div className="flex justify-center p-10"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
                    <ArchitectPage theme={t} />
                </Suspense>
            )}

            {/* Builder Tab */}
            {activeTab === "builder" && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Sidebar */}
                    <div
                        className={`
              lg:col-span-1 space-y-3 
              max-h-[calc(100vh-200px)] overflow-y-auto pr-2 
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
                                        {personalities.find((p) => p.id === settings.personality)?.description || personalities.find((p) => p.id === settings.personality)?.desc}
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
                            <CollapsibleSection title="Perspectives" icon={Users} defaultOpen={false} theme={t}>
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
                                        className={`p-2.5 rounded-lg transition-colors ${t.button}`}
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
                                <div className="space-y-1 max-h-48 overflow-y-auto">
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
                          flex flex-col p-2.5 rounded-lg 
                          border text-xs ${t.border} ${t.listItemHover} transition-colors
                        `}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`font-medium truncate ${t.text} flex items-center gap-2`}>
                                                            {saved.name}
                                                            {saved.versions && saved.versions.length > 0 && (
                                                                <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
                                                                    v{saved.versions.length + 1}
                                                                </span>
                                                            )}
                                                        </div>
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
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Version History Toggle */}
                                                {saved.versions && saved.versions.length > 0 && (
                                                    <details className="group">
                                                        <summary className={`cursor-pointer text-[10px] ${t.textSecondary} flex items-center gap-1 mt-1 hover:text-blue-400`}>
                                                            <History className="w-3 h-3" />
                                                            View {saved.versions.length} past versions
                                                        </summary>
                                                        <div className="pl-2 mt-2 space-y-2 border-l-2 border-slate-700/50">
                                                            {saved.versions.map((ver, idx) => (
                                                                <div key={ver.versionId || idx} className="flex justify-between items-start">
                                                                    <div>
                                                                        <div className="text-[10px] text-slate-400">{new Date(ver.timestamp).toLocaleDateString()}</div>
                                                                        <div className="text-[10px] text-slate-500 italic truncate max-w-[150px]">{ver.commitMessage || "Update"}</div>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => loadPrompt(ver)}
                                                                        className="px-1.5 py-0.5 text-[9px] bg-slate-700 hover:bg-slate-600 rounded text-slate-300"
                                                                    >
                                                                        Restore
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </details>
                                                )}
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
                            className={`lg:hidden p-2.5 rounded-lg ${t.button}`}
                        >
                            {expandedSidebar ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </button>

                        {/* Remix Attribution Banner */}
                        {settings.sourceId && settings.remixMeta && (
                            <div className={`mb-4 p-3 rounded-xl border ${t.border} bg-blue-500/10 border-blue-500/20 flex items-center gap-3 animate-slide-up`}>
                                <GitBranch className="w-5 h-5 text-blue-500" />
                                <div className="flex-1">
                                    <div className={`text-sm ${t.text}`}>
                                        <span className={t.textSecondary}>Remixing </span>
                                        <span className="font-semibold">{settings.remixMeta.title}</span>
                                        {settings.remixMeta.author && (
                                            <>
                                                <span className={t.textSecondary}> by </span>
                                                <span className="font-medium text-blue-400">@{settings.remixMeta.author.username}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, sourceId: null, remixMeta: null })}
                                    className={`p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors`}
                                    title="Detach from source"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <AnimatedCard className={`${t.card} rounded-xl border ${t.border} p-4`}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className={`font-medium text-sm flex items-center ${t.text}`}>
                                    <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
                                    Your Prompt
                                </h3>
                                <Suspense fallback={<div className="w-32 h-8 bg-slate-700/50 rounded animate-pulse" />}>
                                    <MagicRefineButton
                                        inputPrompt={inputPrompt}
                                        onRefine={setInputPrompt}
                                        theme={t}
                                    />
                                </Suspense>
                            </div>
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
                    ${t.accent} ${t.accentHover}
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
                                    className={`p-2.5 rounded-lg transition-colors ${t.button}`}
                                    title="Import prompt"
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
                                <div className="space-y-2 max-h-48 overflow-y-auto">
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
                                <div className="space-y-2 max-h-32 overflow-y-auto">
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
                                                toast.success('Copied to clipboard!', { icon: '✨' });
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
                    rounded-lg p-4 border max-h-96 overflow-y-auto 
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
        </>
    );
};
