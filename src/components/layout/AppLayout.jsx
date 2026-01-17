import React from "react";
import { Toaster } from 'react-hot-toast';
import { SettingsPanel } from "../common";
import { Header } from "./Header";

export const AppLayout = ({
    children,
    t,
    theme,
    isDark,
    toggleTheme,
    isEnabled,
    openSettings,
    setSettings,
    resetAll,
    serializeState,
    showAnalytics,
    setShowAnalytics,
    stats,
    tabs,
    activeTab,
    setActiveTab
}) => {
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

                <div className="relative z-10 max-w-7xl mx-auto p-3 sm:p-4 md:p-6">
                    <Header
                        t={t}
                        isDark={isDark}
                        toggleTheme={toggleTheme}
                        isEnabled={isEnabled}
                        showAnalytics={showAnalytics}
                        setShowAnalytics={setShowAnalytics}
                        openSettings={openSettings}
                        resetAll={resetAll}
                        serializeState={serializeState}
                        stats={stats}
                        tabs={tabs}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                    />

                    {children}
                </div>
            </div>
        </>
    );
};
