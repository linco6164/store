import { useState } from "react";

import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    router,
    useLocalSearchParams,
} from "expo-router";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    useTheme,
} from "@/theme";

import {
    useAuth,
} from "@/hooks/useAuth";

export default function TwoFactorScreen() {
    const { theme } =
        useTheme();

    const {
        verifyTwoFactor,
    } = useAuth();

    const params =
        useLocalSearchParams<{
            userId?: string;
            email?: string;
        }>();

    const [code, setCode] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const styles =
        createStyles(theme);

    async function handleVerify() {
        const cleanCode =
            code.replace(/\D/g, "");

        setError("");

        if (!cleanCode) {
            setError(
                "Introdu codul de verificare."
            );
            return;
        }

        if (cleanCode.length !== 6) {
            setError(
                "Codul trebuie să conțină 6 cifre."
            );
            return;
        }

        if (!params.userId) {
            setError(
                "Sesiunea de autentificare a expirat. Te rugăm să te conectezi din nou."
            );
            return;
        }

        try {
            setLoading(true);

            await verifyTwoFactor({
                userId:
                    params.userId,
                code: cleanCode,
                email:
                    params.email,
            });

            router.replace(
                "/(tabs)"
            );
        } catch (error: any) {
            console.error(
                "2FA error:",
                error
            );

            const message =
                error?.response
                    ?.data?.message;

            setError(
                Array.isArray(message)
                    ? message.join(
                          ", "
                      )
                    : message ||
                          "Codul de verificare este incorect."
            );
        } finally {
            setLoading(false);
        }
    }

    function handleCodeChange(
        value: string
    ) {
        const numeric =
            value
                .replace(/\D/g, "")
                .slice(0, 6);

        setCode(numeric);
        setError("");
    }

    return (
        <View
            style={
                styles.container
            }
        >
            <View
                style={
                    styles.content
                }
            >
                {/* LOGO */}

                <View
                    style={
                        styles.logo
                    }
                >
                    <Text
                        style={
                            styles.logoText
                        }
                    >
                        N
                    </Text>
                </View>

                <Text
                    style={
                        styles.brand
                    }
                >
                    NEXORA
                </Text>

                {/* ICON */}

                <View
                    style={
                        styles.securityIcon
                    }
                >
                    <Ionicons
                        name="shield-checkmark-outline"
                        size={34}
                        color={
                            theme
                                .colors
                                .primary
                        }
                    />
                </View>

                {/* TITLE */}

                <Text
                    style={
                        styles.title
                    }
                >
                    Verificare în doi pași
                </Text>

                <Text
                    style={
                        styles.description
                    }
                >
                    Introdu codul de verificare
                    pentru a continua autentificarea.
                </Text>

                {params.email ? (
                    <Text
                        style={
                            styles.email
                        }
                    >
                        {params.email}
                    </Text>
                ) : null}

                {/* ERROR */}

                {error ? (
                    <View
                        style={
                            styles.errorBox
                        }
                    >
                        <Ionicons
                            name="alert-circle-outline"
                            size={19}
                            color={
                                theme
                                    .colors
                                    .danger
                            }
                        />

                        <Text
                            style={
                                styles.errorText
                            }
                        >
                            {error}
                        </Text>
                    </View>
                ) : null}

                {/* CODE */}

                <View
                    style={
                        styles.field
                    }
                >
                    <Text
                        style={
                            styles.label
                        }
                    >
                        Cod de verificare
                    </Text>

                    <TextInput
                        value={code}
                        onChangeText={
                            handleCodeChange
                        }
                        keyboardType="number-pad"
                        maxLength={6}
                        autoFocus
                        textContentType="oneTimeCode"
                        autoComplete="one-time-code"
                        placeholder="000000"
                        placeholderTextColor={
                            theme
                                .colors
                                .textMuted
                        }
                        style={[
                            styles.codeInput,
                            error &&
                                styles.codeInputError,
                        ]}
                    />
                </View>

                {/* VERIFY */}

                <Pressable
                    onPress={
                        handleVerify
                    }
                    disabled={
                        loading
                    }
                    style={({ pressed }) => [
                        styles.verifyButton,

                        pressed &&
                            !loading &&
                            styles.pressed,

                        loading &&
                            styles.disabled,
                    ]}
                >
                    {loading ? (
                        <ActivityIndicator
                            size="small"
                            color={
                                theme
                                    .colors
                                    .primaryText
                            }
                        />
                    ) : (
                        <>
                            <Text
                                style={
                                    styles.verifyText
                                }
                            >
                                Verifică
                            </Text>

                            <Ionicons
                                name="arrow-forward"
                                size={19}
                                color={
                                    theme
                                        .colors
                                        .primaryText
                                }
                            />
                        </>
                    )}
                </Pressable>

                {/* BACK */}

                <Pressable
                    onPress={() =>
                        router.back()
                    }
                    disabled={
                        loading
                    }
                    style={
                        styles.backButton
                    }
                >
                    <Ionicons
                        name="arrow-back"
                        size={17}
                        color={
                            theme
                                .colors
                                .textSecondary
                        }
                    />

                    <Text
                        style={
                            styles.backText
                        }
                    >
                        Înapoi la autentificare
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

function createStyles(
    theme: ReturnType<
        typeof useTheme
    >["theme"]
) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor:
                theme.colors
                    .background,
        },

        content: {
            flex: 1,
            width: "100%",
            maxWidth: 460,
            alignSelf: "center",
            justifyContent:
                "center",
            paddingHorizontal:
                theme.spacing.xl,
        },

        logo: {
            width: 56,
            height: 56,
            alignSelf: "center",
            alignItems:
                "center",
            justifyContent:
                "center",
            borderRadius:
                theme.radius.lg,
            backgroundColor:
                theme.colors.primary,
        },

        logoText: {
            color:
                theme.colors
                    .primaryText,
            fontSize: 27,
            fontWeight: "900",
        },

        brand: {
            marginTop:
                theme.spacing.sm,
            textAlign: "center",
            color:
                theme.colors.text,
            fontSize: 18,
            fontWeight: "900",
            letterSpacing: 1.5,
        },

        securityIcon: {
            width: 72,
            height: 72,
            alignSelf: "center",
            alignItems:
                "center",
            justifyContent:
                "center",
            marginTop:
                theme.spacing["3xl"],
            marginBottom:
                theme.spacing.xl,
            borderRadius:
                theme.radius.full,
            backgroundColor:
                theme.colors
                    .primarySoft,
        },

        title: {
            textAlign: "center",
            color:
                theme.colors.text,
            fontSize: 25,
            fontWeight: "800",
            letterSpacing: -0.5,
        },

        description: {
            marginTop:
                theme.spacing.sm,
            textAlign: "center",
            color:
                theme.colors
                    .textSecondary,
            fontSize: 14,
            lineHeight: 21,
        },

        email: {
            marginTop:
                theme.spacing.md,
            textAlign: "center",
            color:
                theme.colors.text,
            fontSize: 13,
            fontWeight: "700",
        },

        errorBox: {
            flexDirection:
                "row",
            alignItems:
                "center",
            gap:
                theme.spacing.sm,
            marginTop:
                theme.spacing.xl,
            padding:
                theme.spacing.md,
            borderRadius:
                theme.radius.md,
            backgroundColor:
                theme.colors
                    .dangerBackground,
            borderWidth: 1,
            borderColor:
                theme.colors.danger,
        },

        errorText: {
            flex: 1,
            color:
                theme.colors.danger,
            fontSize: 13,
            lineHeight: 18,
        },

        field: {
            marginTop:
                theme.spacing["2xl"],
        },

        label: {
            marginBottom:
                theme.spacing.sm,
            color:
                theme.colors.text,
            fontSize: 13,
            fontWeight: "700",
        },

        codeInput: {
            height: 60,
            width: "100%",
            borderWidth: 1,
            borderColor:
                theme.colors.border,
            borderRadius:
                theme.radius.lg,
            backgroundColor:
                theme.colors.surface,
            color:
                theme.colors.text,
            textAlign: "center",
            fontSize: 25,
            fontWeight: "800",
            letterSpacing: 8,
        },

        codeInputError: {
            borderColor:
                theme.colors.danger,
        },

        verifyButton: {
            height: 54,
            marginTop:
                theme.spacing.xl,
            flexDirection:
                "row",
            alignItems:
                "center",
            justifyContent:
                "center",
            gap:
                theme.spacing.sm,
            borderRadius:
                theme.radius.lg,
            backgroundColor:
                theme.colors.primary,
        },

        verifyText: {
            color:
                theme.colors
                    .primaryText,
            fontSize: 15,
            fontWeight: "800",
        },

        backButton: {
            flexDirection:
                "row",
            alignItems:
                "center",
            justifyContent:
                "center",
            gap:
                theme.spacing.xs,
            marginTop:
                theme.spacing.xl,
            paddingVertical:
                theme.spacing.sm,
        },

        backText: {
            color:
                theme.colors
                    .textSecondary,
            fontSize: 13,
            fontWeight: "600",
        },

        pressed: {
            opacity: 0.82,
            transform: [
                {
                    scale: 0.99,
                },
            ],
        },

        disabled: {
            opacity: 0.6,
        },
    });
}