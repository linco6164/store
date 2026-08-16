import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";

import {
    Stack,
} from "expo-router";

import {
    StatusBar,
} from "expo-status-bar";

import {
    SafeAreaProvider,
} from "react-native-safe-area-context";

import "react-native-reanimated";

import {
    useColorScheme,
} from "@/hooks/use-color-scheme";

import {
    NexoraThemeProvider,
} from "@/theme";

import {
    AuthProvider,
} from "@/hooks/useAuth";

import UpdateManager from "@/components/UpdateManager";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme =
        useColorScheme();

    return (
        <SafeAreaProvider>
            <AuthProvider>
                <NexoraThemeProvider>
                <UpdateManager />
                    <ThemeProvider
                        value={
                            colorScheme ===
                                "dark"
                                ? DarkTheme
                                : DefaultTheme
                        }
                    >
                        <Stack
                            screenOptions={{
                                headerShown:
                                    false,
                            }}
                        >
                            <Stack.Screen
                                name="(tabs)"
                            />

                            <Stack.Screen
                                name="(auth)/login"
                            />

                            <Stack.Screen
                                name="(auth)/two-factor"
                            />

                            <Stack.Screen
                                name="modal"
                                options={{
                                    presentation:
                                        "modal",
                                }}
                            />
                        </Stack>

                        <StatusBar
                            style={
                                colorScheme ===
                                    "dark"
                                    ? "light"
                                    : "dark"
                            }
                        />
                    </ThemeProvider>
                </NexoraThemeProvider>
            </AuthProvider>
        </SafeAreaProvider>
    );
}