import {
    ReactNode,
} from "react";

import {
    StyleProp,
    StyleSheet,
    ViewStyle,
} from "react-native";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    useTheme,
} from "@/theme";

interface SafeScreenProps {
    children: ReactNode;
    style?: StyleProp<ViewStyle>;
    edges?: (
        | "top"
        | "bottom"
        | "left"
        | "right"
    )[];
}

export function SafeScreen({
    children,
    style,
    edges = [
        "top",
        "left",
        "right",
        "bottom",
    ],
}: SafeScreenProps) {
    const { theme } =
        useTheme();

    return (
        <SafeAreaView
            edges={edges}
            style={[
                styles.container,
                {
                    backgroundColor:
                        theme.colors
                            .background,
                },
                style,
            ]}
        >
            {children}
        </SafeAreaView>
    );
}

const styles =
    StyleSheet.create({
        container: {
            flex: 1,
        },
    });
