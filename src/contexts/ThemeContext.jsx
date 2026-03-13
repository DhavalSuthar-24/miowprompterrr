import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const saved = localStorage.getItem('miow_theme');
            if (saved === 'light' || saved === 'dark') return saved;
            // Check system preference
            if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
                return 'dark';
            }
            return 'dark';
        } catch {
            return 'dark';
        }
    });

    // Elegant theme configurations - no neon, sophisticated tones
    const themes = {
        dark: {
            name: 'dark',
            bg: "bg-slate-950",
            bgGradient: "bg-slate-950 bg-[radial-gradient(900px_circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)]",
            card: "bg-slate-900",
            cardSolid: "bg-slate-900",
            cardHover: "hover:bg-slate-800",
            cardActive: "bg-slate-800",
            border: "border-slate-800",
            borderSubtle: "border-slate-800/50",
            borderHover: "hover:border-slate-600",
            borderActive: "border-blue-500/50",
            text: "text-slate-100",
            textSecondary: "text-slate-400",
            textMuted: "text-slate-500",
            textInverse: "text-slate-900",
            input: "bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20",
            inputHover: "hover:border-slate-600",
            button: "bg-slate-900 text-slate-100 hover:bg-slate-800 border border-slate-800",
            buttonHover: "hover:bg-slate-700",
            buttonActive: "bg-blue-600 text-white border-blue-500",
            buttonGhost: "text-slate-400 hover:text-slate-100 hover:bg-slate-800",
            accent: "bg-blue-600 text-white",
            accentHover: "hover:bg-blue-500",
            accentSubtle: "bg-blue-600/10 text-blue-400",
            cta: "bg-orange-500 text-white",
            ctaHover: "hover:bg-orange-600",
            success: "text-emerald-400",
            successBg: "bg-emerald-500/10",
            warning: "text-amber-400",
            warningBg: "bg-amber-500/10",
            error: "text-red-400",
            errorBg: "bg-red-500/10",
            info: "text-blue-400",
            infoBg: "bg-blue-500/10",
            divider: "border-slate-800",
            shadow: "shadow-lg shadow-black/20",
            shadowSubtle: "shadow-md shadow-black/10",
            tabInactive: "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50",
            listItemHover: "hover:bg-slate-800/50",
            scrollbar: "scrollbar-dark",
            ring: "ring-blue-500/30",
        },
        light: {
            name: 'light',
            bg: "bg-slate-50",
            bgGradient: "bg-slate-50 bg-[radial-gradient(900px_circle_at_top,_rgba(59,130,246,0.12),_transparent_55%)]",
            card: "bg-white",
            cardSolid: "bg-white",
            cardHover: "hover:bg-slate-50",
            cardActive: "bg-slate-100",
            border: "border-slate-200",
            borderSubtle: "border-slate-200/50",
            borderHover: "hover:border-slate-300",
            borderActive: "border-blue-500/50",
            text: "text-slate-900",
            textSecondary: "text-slate-600",
            textMuted: "text-slate-500",
            textInverse: "text-white",
            input: "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20",
            inputHover: "hover:border-slate-400",
            button: "bg-white text-slate-900 hover:bg-slate-100 border border-slate-200",
            buttonHover: "hover:bg-slate-200",
            buttonActive: "bg-blue-600 text-white border-blue-600",
            buttonGhost: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
            accent: "bg-blue-600 text-white",
            accentHover: "hover:bg-blue-700",
            accentSubtle: "bg-blue-50 text-blue-700",
            cta: "bg-orange-500 text-white",
            ctaHover: "hover:bg-orange-600",
            success: "text-emerald-600",
            successBg: "bg-emerald-50",
            warning: "text-amber-600",
            warningBg: "bg-amber-50",
            error: "text-red-600",
            errorBg: "bg-red-50",
            info: "text-blue-600",
            infoBg: "bg-blue-50",
            divider: "border-slate-200",
            shadow: "shadow-lg shadow-slate-200/50",
            shadowSubtle: "shadow-md shadow-slate-200/30",
            tabInactive: "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
            listItemHover: "hover:bg-slate-50",
            scrollbar: "scrollbar-light",
            ring: "ring-blue-500/30",
        },
    };

    const currentTheme = themes[theme];

    const toggleTheme = useCallback(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    }, []);

    const setThemeMode = useCallback((mode) => {
        if (mode === 'light' || mode === 'dark') {
            setTheme(mode);
        }
    }, []);

    // Persist theme
    useEffect(() => {
        try {
            localStorage.setItem('miow_theme', theme);
            // Update document class for global styling
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(theme);
        } catch (e) {
            console.error('Failed to save theme:', e);
        }
    }, [theme]);

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            // Only auto-switch if no saved preference
            const saved = localStorage.getItem('miow_theme');
            if (!saved) {
                setTheme(e.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    return (
        <ThemeContext.Provider value={{
            theme,
            t: currentTheme,
            themes,
            toggleTheme,
            setTheme: setThemeMode,
            isDark: theme === 'dark',
            isLight: theme === 'light',
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export default ThemeContext;
