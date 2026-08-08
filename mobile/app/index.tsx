import {
    ActivityIndicator,
    StyleSheet,
    View,
} from "react-native";

import { Redirect } from "expo-router";

import { useAuth } from "@/hooks/useAuth";

export default function Index() {
    const {
        user,
        loading,
    } = useAuth();

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator
                    size="large"
                    color="#111827"
                />
            </View>
        );
    }

    if (!user) {
        return (
            <Redirect
                href="/(auth)/login"
            />
        );
    }

    return (
        <Redirect
            href="/(tabs)"
        />
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f8fafc",
    },
});