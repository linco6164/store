import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    AppState,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";
import * as Updates from "expo-updates";

const CHECK_INTERVAL_MS = 15 * 60 * 1000;

export default function UpdateManager() {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const lastCheckRef = useRef(0);

    const checkForUpdate = useCallback(async () => {
        if (Platform.OS === "web" || !Updates.isEnabled) return;

        const now = Date.now();
        if (now - lastCheckRef.current < CHECK_INTERVAL_MS) return;
        lastCheckRef.current = now;

        try {
            setError(null);
            const result = await Updates.checkForUpdateAsync();

            if (result.isAvailable) {
                setUpdateAvailable(true);
            }
        } catch (err) {
            console.warn("EAS Update check failed:", err);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            void checkForUpdate();
        }, 2000);

        const subscription = AppState.addEventListener(
            "change",
            (state) => {
                if (state === "active") {
                    void checkForUpdate();
                }
            }
        );

        return () => {
            clearTimeout(timer);
            subscription.remove();
        };
    }, [checkForUpdate]);

    async function installUpdate() {
        if (isDownloading) return;

        try {
            setIsDownloading(true);
            setError(null);

            const result = await Updates.fetchUpdateAsync();

            if (result.isNew) {
                await Updates.reloadAsync();
                return;
            }

            setUpdateAvailable(false);
        } catch (err) {
            console.error("EAS Update install failed:", err);
            setError(
                "Actualizarea nu a putut fi instalată. Încearcă din nou."
            );
        } finally {
            setIsDownloading(false);
        }
    }

    if (Platform.OS === "web" || !updateAvailable) {
        return null;
    }

    return (
        <Modal
            visible
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={() => {
                if (!isDownloading) setUpdateAvailable(false);
            }}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.icon}>
                        <Text style={styles.iconText}>↑</Text>
                    </View>

                    <Text style={styles.title}>
                        Actualizare disponibilă
                    </Text>

                    <Text style={styles.description}>
                        O versiune nouă Nexora este disponibilă.
                        Actualizează acum pentru cele mai noi
                        îmbunătățiri și remedieri.
                    </Text>

                    {error ? (
                        <Text style={styles.error}>{error}</Text>
                    ) : null}

                    <Pressable
                        onPress={installUpdate}
                        disabled={isDownloading}
                        style={[
                            styles.primaryButton,
                            isDownloading && styles.disabledButton,
                        ]}
                    >
                        {isDownloading ? (
                            <View style={styles.loadingRow}>
                                <ActivityIndicator
                                    size="small"
                                    color="#ffffff"
                                />
                                <Text style={styles.primaryText}>
                                    Se actualizează...
                                </Text>
                            </View>
                        ) : (
                            <Text style={styles.primaryText}>
                                Actualizează acum
                            </Text>
                        )}
                    </Pressable>

                    {!isDownloading ? (
                        <Pressable
                            onPress={() => setUpdateAvailable(false)}
                            style={styles.secondaryButton}
                        >
                            <Text style={styles.secondaryText}>
                                Mai târziu
                            </Text>
                        </Pressable>
                    ) : null}
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    card: {
        width: "100%",
        maxWidth: 420,
        borderRadius: 24,
        padding: 24,
        backgroundColor: "#ffffff",
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 12,
    },
    icon: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: "center",
        marginBottom: 16,
        backgroundColor: "#111111",
    },
    iconText: {
        color: "#ffffff",
        fontSize: 30,
        fontWeight: "800",
    },
    title: {
        textAlign: "center",
        fontSize: 22,
        fontWeight: "800",
        color: "#111111",
    },
    description: {
        marginTop: 10,
        textAlign: "center",
        fontSize: 15,
        lineHeight: 22,
        color: "#666666",
    },
    error: {
        marginTop: 12,
        textAlign: "center",
        fontSize: 13,
        lineHeight: 19,
        color: "#c62828",
    },
    primaryButton: {
        minHeight: 52,
        marginTop: 22,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#111111",
    },
    disabledButton: {
        opacity: 0.7,
    },
    primaryText: {
        color: "#ffffff",
        fontSize: 15,
        fontWeight: "700",
    },
    loadingRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    secondaryButton: {
        minHeight: 48,
        marginTop: 8,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryText: {
        color: "#666666",
        fontSize: 15,
        fontWeight: "600",
    },
});
