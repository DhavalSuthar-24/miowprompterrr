/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "var(--color-primary)",
                    hover: "var(--color-primary-hover)",
                    light: "var(--color-primary-light)",
                },
                secondary: "var(--color-secondary)",
                success: {
                    DEFAULT: "var(--color-success)",
                    light: "var(--color-success-light)",
                },
                warning: {
                    DEFAULT: "var(--color-warning)",
                    light: "var(--color-warning-light)",
                },
                error: {
                    DEFAULT: "var(--color-error)",
                    light: "var(--color-error-light)",
                },
                bg: {
                    primary: "var(--bg-primary)",
                    secondary: "var(--bg-secondary)",
                    card: "var(--bg-card)",
                },
                text: {
                    primary: "var(--text-primary)",
                    secondary: "var(--text-secondary)",
                    muted: "var(--text-muted)",
                },
                border: "var(--border-color)",
            },
            fontFamily: {
                sans: ["var(--font-sans)"],
                mono: ["var(--font-mono)"],
            },
        },
    },
    plugins: [],
}
