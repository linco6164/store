import {
    createContext,
    ReactNode,
    useContext,
    useMemo,
} from "react";

import {
    useColorScheme,
} from "@/hooks/use-color-scheme";

import {
    colors,
    NexoraColors,
} from "./colors";

import {
    spacing,
} from "./spacing";

import {
    radius,
} from "./radius";

import {
    typography,
} from "./typography";

type ThemeMode =
    | "light"
    | "dark";

export interface NexoraTheme {
    mode: ThemeMode;

    colors: NexoraColors;

    spacing: typeof spacing;

    radius: typeof radius;

    typography: typeof typography;
}

interface ThemeContextValue {
    theme: NexoraTheme;
}

const ThemeContext =
    createContext<
        ThemeContextValue | undefined
    >(undefined);

interface Props {
    children: ReactNode;
}

export function NexoraThemeProvider({
    children,
}: Props) {
    const colorScheme =
        useColorScheme();

    const mode: ThemeMode =
        colorScheme === "dark"
            ? "dark"
            : "light";

    const theme =
        useMemo<NexoraTheme>(
            () => ({
                mode,

                colors:
                    colors[mode],

                spacing,

                radius,

                typography,
            }),
            [mode]
        );

    return (
        <ThemeContext.Provider
            value={{
                theme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context =
        useContext(
            ThemeContext
        );

    if (!context) {
        throw new Error(
            "useTheme must be used inside NexoraThemeProvider"
        );
    }

    return context;
}