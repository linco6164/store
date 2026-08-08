export const colors = {
    light: {
        background: "#ffffff",
        surface: "#ffffff",
        surfaceSecondary: "#f8fafc",

        text: "#111827",
        textSecondary: "#64748b",
        textMuted: "#94a3b8",

        border: "#e5e7eb",
        borderStrong: "#cbd5e1",

        primary: "#00b67a",
        primaryDark: "#009b68",
        primarySoft: "#e8fff6",
        primaryText: "#ffffff",

        blue: "#2563eb",
        blueSoft: "#eff6ff",

        purple: "#7c3aed",

        danger: "#ef4444",
        dangerBackground: "#fef2f2",

        success: "#16a34a",
        successBackground: "#f0fdf4",

        warning: "#f59e0b",
        warningBackground: "#fffbeb",

        overlay: "rgba(255,255,255,0.45)",
    },

    dark: {
        background: "#0b0f14",
        surface: "#111827",
        surfaceSecondary: "#172033",

        text: "#f8fafc",
        textSecondary: "#94a3b8",
        textMuted: "#64748b",

        border: "#273244",
        borderStrong: "#3b4658",

        primary: "#00c98a",
        primaryDark: "#00b67a",
        primarySoft: "#063b2d",
        primaryText: "#ffffff",

        blue: "#3b82f6",
        blueSoft: "#172554",

        purple: "#8b5cf6",

        danger: "#f87171",
        dangerBackground: "#450a0a",

        success: "#4ade80",
        successBackground: "#052e16",

        warning: "#fbbf24",
        warningBackground: "#451a03",

        overlay: "rgba(0,0,0,0.45)",
    },
} as const;

export type NexoraColors =
    (typeof colors)[keyof typeof colors];