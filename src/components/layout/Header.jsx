import React from "react";
import {
    Wand2,
    Sun,
    Moon,
    TrendingUp,
    Settings2
} from "lucide-react";
import toast from 'react-hot-toast';
import { StatsWidget } from "../common";

export const Header = ({
    t,
    isDark,
    toggleTheme,
    isEnabled,
    showAnalytics,
    setShowAnalytics,
    openSettings,
    resetAll,
    serializeState,
    stats,
    tabs,
    activeTab,
    setActiveTab
}) => {
    return (
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
                        className={`p-2.5 rounded-xl transition-all duration-200 ${t.button}`}
                        title="Toggle theme"
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    {isEnabled('showAnalyticsWidget') && (
                        <button
                            onClick={() => setShowAnalytics(!showAnalytics)}
                            className={`p-2.5 rounded-xl transition-all duration-200 ${showAnalytics ? t.buttonActive : t.button}`}
                            title="Toggle analytics"
                        >
                            <TrendingUp className="w-5 h-5" />
                        </button>
                    )}
                    <button
                        onClick={openSettings}
                        className={`p-2.5 rounded-xl transition-all duration-200 ${t.button}`}
                        title="Settings"
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
                            toast.success('Shareable URL copied!', { icon: '🔗' });
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
    );
};
