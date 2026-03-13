import React from 'react';
import { X, RotateCcw, Moon, Sun, Settings2, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useFeatureToggle } from '../../contexts/FeatureToggleContext';
import Switch from './Switch';

const SettingsPanel = ({ onSettingsReset }) => {
    const { theme, t, toggleTheme, isDark } = useTheme();
    const {
        features,
        toggleFeature,
        featureGroups,
        resetToDefaults,
        featureSettingsMap,
        isSettingsOpen,
        closeSettings,
    } = useFeatureToggle();

    if (!isSettingsOpen) return null;

    const handleToggle = (featureKey) => {
        const isCurrentlyEnabled = features[featureKey];

        // If disabling and it affects settings, reset them
        if (isCurrentlyEnabled && featureSettingsMap[featureKey] && onSettingsReset) {
            onSettingsReset(featureSettingsMap[featureKey]);
        }

        toggleFeature(featureKey);
    };

    const handleResetAll = () => {
        // Reset all prompt-affecting features' settings
        if (onSettingsReset) {
            const allResets = {};
            Object.values(featureSettingsMap).forEach(resetObj => {
                Object.assign(allResets, resetObj);
            });
            onSettingsReset(allResets);
        }
        resetToDefaults();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={closeSettings}
            />

            {/* Panel */}
            <div
                className={`
        fixed right-0 top-0 bottom-0 w-full max-w-md z-50
        ${t.cardSolid} ${t.border} border-l
        shadow-2xl
        overflow-hidden
        animate-slide-in-right
      `}
                role="dialog"
                aria-modal="true"
                aria-label="Settings panel"
            >
                {/* Header */}
                <div className={`
          flex items-center justify-between p-4 border-b ${t.border}
        `}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${t.accentSubtle}`}>
                            <Settings2 className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className={`font-semibold ${t.text}`}>Settings</h2>
                            <p className={`text-xs ${t.textSecondary}`}>Customize features & appearance</p>
                        </div>
                    </div>
                    <button
                        onClick={closeSettings}
                        className={`p-2 rounded-lg btn-touch ${t.buttonGhost} transition-colors`}
                        aria-label="Close settings"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className={`overflow-y-auto h-[calc(100vh-140px)] p-4 space-y-6 ${t.scrollbar}`}>
                    {/* Theme Section */}
                    <div className="space-y-3">
                        <h3 className={`text-sm font-medium ${t.text}`}>Appearance</h3>
                        <div className={`flex items-center justify-between p-3 rounded-lg ${t.card} ${t.border} border`}>
                            <div className="flex items-center gap-3">
                                {isDark ? (
                                    <Moon className={`w-5 h-5 ${t.textSecondary}`} />
                                ) : (
                                    <Sun className={`w-5 h-5 ${t.textSecondary}`} />
                                )}
                                <div>
                                    <p className={`text-sm font-medium ${t.text}`}>
                                        {isDark ? 'Dark Mode' : 'Light Mode'}
                                    </p>
                                    <p className={`text-xs ${t.textSecondary}`}>
                                        {isDark ? 'Easy on the eyes' : 'Bright and clear'}
                                    </p>
                                </div>
                            </div>
                            <Switch checked={isDark} onChange={toggleTheme} />
                        </div>
                    </div>

                    {/* Feature Groups */}
                    {Object.entries(featureGroups).map(([groupKey, group]) => (
                        <div key={groupKey} className="space-y-3">
                            <div>
                                <h3 className={`text-sm font-medium ${t.text}`}>{group.label}</h3>
                                {group.description && (
                                    <p className={`text-xs ${t.textSecondary} mt-0.5`}>{group.description}</p>
                                )}
                            </div>

                            {/* Show warning for prompt features */}
                            {groupKey === 'promptFeatures' && (
                                <div className={`flex items-start gap-2 p-2 rounded-lg ${t.warningBg} text-xs`}>
                                    <AlertCircle className={`w-4 h-4 ${t.warning} flex-shrink-0 mt-0.5`} />
                                    <span className={t.warning}>
                                        Disabling these will reset their settings and exclude them from generated prompts.
                                    </span>
                                </div>
                            )}

                            <div className={`rounded-lg ${t.card} ${t.border} border overflow-hidden divide-y ${t.divider}`}>
                                {group.features.map((feature) => (
                                    <div
                                        key={feature.key}
                                        className={`flex items-center justify-between p-3 ${t.cardHover} transition-colors`}
                                    >
                                        <div className="flex-1 min-w-0 pr-3">
                                            <span className={`text-sm ${t.text}`}>{feature.label}</span>
                                            {feature.desc && (
                                                <p className={`text-xs ${t.textMuted} truncate`}>{feature.desc}</p>
                                            )}
                                        </div>
                                        <Switch
                                            checked={features[feature.key]}
                                            onChange={() => handleToggle(feature.key)}
                                            size="sm"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${t.border} ${t.cardSolid}`}>
                    <button
                        onClick={handleResetAll}
                        className={`
              w-full flex items-center justify-center gap-2 
              py-2.5 px-4 rounded-lg
              ${t.button} transition-colors
              text-sm font-medium
            `}
                    >
                        <RotateCcw className="w-4 h-4" />
                        Reset to Defaults
                    </button>
                </div>
            </div>
        </>
    );
};

export default SettingsPanel;
