import {
    useState,
} from "react";

import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    Link,
    router,
} from "expo-router";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    useAuth,
} from "@/hooks/useAuth";

import {
    useTheme,
} from "@/theme";

export default function LoginScreen() {
    const {
        theme,
    } = useTheme();

    const {
        login,
    } = useAuth();

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    async function handleLogin() {
        setError("");

        const normalizedEmail =
            email
                .trim()
                .toLowerCase();

        if (!normalizedEmail) {
            setError(
                "Introdu adresa de email."
            );
            return;
        }

        if (!password) {
            setError(
                "Introdu parola."
            );
            return;
        }

        try {
            setLoading(true);

            const result = await login({
                email: normalizedEmail,
                password,
            });

            if (result.requiresTwoFactor) {
                router.push({
                    pathname:
                        "/(auth)/two-factor",
                    params: {
                        userId:
                            result.userId!,
                        email: normalizedEmail,
                    },
                });

                return;
            }

            router.replace(
                "/(tabs)"
            );
        } catch (error: any) {
            console.error(
                "Login error:",
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
                    "Emailul sau parola sunt incorecte."
            );
        } finally {
            setLoading(false);
        }
    }

    const styles =
        createStyles(theme);

    return (
        <KeyboardAvoidingView
            style={
                styles.container
            }
            behavior={
                Platform.OS === "ios"
                    ? "padding"
                    : undefined
            }
        >
            <ScrollView
                contentContainerStyle={
                    styles.content
                }
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={
                    false
                }
            >
                {/* Brand */}

                <View
                    style={
                        styles.brand
                    }
                >
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
                            styles.brandName
                        }
                    >
                        Nexora
                    </Text>

                    <Text
                        style={
                            styles.subtitle
                        }
                    >
                        Cumpără. Vinde.
                        Descoperă.
                    </Text>
                </View>

                {/* Card */}

                <View
                    style={
                        styles.card
                    }
                >
                    <Text
                        style={
                            styles.title
                        }
                    >
                        Bine ai revenit
                    </Text>

                    <Text
                        style={
                            styles.description
                        }
                    >
                        Conectează-te la
                        contul tău Nexora.
                    </Text>

                    {/* Error */}

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

                    {/* Email */}

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
                            Email
                        </Text>

                        <View
                            style={[
                                styles.inputWrapper,
                                email.length >
                                0 &&
                                styles.inputWrapperFocused,
                            ]}
                        >
                            <Ionicons
                                name="mail-outline"
                                size={20}
                                color={
                                    theme
                                        .colors
                                        .textMuted
                                }
                            />

                            <TextInput
                                value={
                                    email
                                }
                                onChangeText={
                                    setEmail
                                }
                                placeholder="email@exemplu.ro"
                                placeholderTextColor={
                                    theme
                                        .colors
                                        .textMuted
                                }
                                autoCapitalize="none"
                                autoCorrect={
                                    false
                                }
                                keyboardType="email-address"
                                textContentType="emailAddress"
                                selectionColor={
                                    theme
                                        .colors
                                        .primary
                                }
                                style={
                                    styles.input
                                }
                            />
                        </View>
                    </View>

                    {/* Password */}

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
                            Parolă
                        </Text>

                        <View
                            style={[
                                styles.inputWrapper,
                                password.length >
                                0 &&
                                styles.inputWrapperFocused,
                            ]}
                        >
                            <Ionicons
                                name="lock-closed-outline"
                                size={20}
                                color={
                                    theme
                                        .colors
                                        .textMuted
                                }
                            />

                            <TextInput
                                value={
                                    password
                                }
                                onChangeText={
                                    setPassword
                                }
                                placeholder="Introdu parola"
                                placeholderTextColor={
                                    theme
                                        .colors
                                        .textMuted
                                }
                                secureTextEntry={
                                    !showPassword
                                }
                                autoCapitalize="none"
                                autoCorrect={
                                    false
                                }
                                textContentType="password"
                                selectionColor={
                                    theme
                                        .colors
                                        .primary
                                }
                                style={
                                    styles.input
                                }
                            />

                            <Pressable
                                onPress={() =>
                                    setShowPassword(
                                        (
                                            value
                                        ) =>
                                            !value
                                    )
                                }
                                hitSlop={10}
                            >
                                <Ionicons
                                    name={
                                        showPassword
                                            ? "eye-off-outline"
                                            : "eye-outline"
                                    }
                                    size={21}
                                    color={
                                        theme
                                            .colors
                                            .textSecondary
                                    }
                                />
                            </Pressable>
                        </View>
                    </View>

                    {/* Forgot password */}

                    <Pressable
                        onPress={() => {
                            // TODO:
                            // Forgot Password
                        }}
                        style={
                            styles.forgotButton
                        }
                    >
                        <Text
                            style={
                                styles.forgotText
                            }
                        >
                            Ai uitat
                            parola?
                        </Text>
                    </Pressable>

                    {/* Login */}

                    <Pressable
                        onPress={
                            handleLogin
                        }
                        disabled={
                            loading
                        }
                        style={({
                            pressed,
                        }) => [
                                styles.loginButton,

                                pressed &&
                                !loading &&
                                styles.buttonPressed,

                                loading &&
                                styles.buttonDisabled,
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
                            <Text
                                style={
                                    styles.loginButtonText
                                }
                            >
                                Conectare
                            </Text>
                        )}
                    </Pressable>

                    {/* Register */}

                    <View
                        style={
                            styles.registerRow
                        }
                    >
                        <Text
                            style={
                                styles.registerText
                            }
                        >
                            Nu ai încă un
                            cont?
                        </Text>

                        <Link
                            href="/(auth)/register"
                            style={
                                styles.registerLink
                            }
                        >
                            Creează cont
                        </Link>
                    </View>
                </View>

                <Text
                    style={
                        styles.footer
                    }
                >
                    Continuând, ești de
                    acord cu termenii și
                    politica de
                    confidențialitate
                    Nexora.
                </Text>
            </ScrollView>
        </KeyboardAvoidingView>
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
            flexGrow: 1,
            justifyContent:
                "center",
            paddingHorizontal:
                theme.spacing.xl,
            paddingVertical:
                theme.spacing["4xl"],
        },

        brand: {
            alignItems:
                "center",
            marginBottom:
                theme.spacing["3xl"],
        },

        logo: {
            width: 58,
            height: 58,
            borderRadius:
                theme.radius.lg,
            backgroundColor:
                theme.colors
                    .primary,
            alignItems:
                "center",
            justifyContent:
                "center",
            marginBottom:
                theme.spacing.md,
        },

        logoText: {
            color:
                theme.colors
                    .primaryText,
            fontSize: 28,
            fontWeight:
                "800",
        },

        brandName: {
            fontSize: 27,
            fontWeight:
                "800",
            color:
                theme.colors.text,
            letterSpacing: -0.8,
        },

        subtitle: {
            marginTop:
                theme.spacing.xs,
            fontSize: 13,
            color:
                theme.colors
                    .textSecondary,
        },

        card: {
            width: "100%",
            maxWidth: 460,
            alignSelf:
                "center",
            backgroundColor:
                theme.colors
                    .surface,
            borderRadius:
                theme.radius["2xl"],
            padding:
                theme.spacing.xl,
            borderWidth: 1,
            borderColor:
                theme.colors
                    .border,
        },

        title: {
            fontSize: 24,
            fontWeight:
                "800",
            color:
                theme.colors.text,
            letterSpacing:
                -0.4,
        },

        description: {
            marginTop:
                theme.spacing.xs,
            marginBottom:
                theme.spacing.xl,
            fontSize: 14,
            lineHeight: 21,
            color:
                theme.colors
                    .textSecondary,
        },

        errorBox: {
            flexDirection:
                "row",
            alignItems:
                "center",
            gap:
                theme.spacing.sm,
            marginBottom:
                theme.spacing.lg,
            borderRadius:
                theme.radius.md,
            paddingHorizontal:
                theme.spacing.md,
            paddingVertical:
                theme.spacing.md,
            backgroundColor:
                theme.colors
                    .dangerBackground,
            borderWidth: 1,
            borderColor:
                theme.colors
                    .danger,
        },

        errorText: {
            flex: 1,
            fontSize: 13,
            lineHeight: 18,
            color:
                theme.colors
                    .danger,
            fontWeight:
                "500",
        },

        field: {
            marginBottom:
                theme.spacing.lg,
        },

        label: {
            marginBottom:
                theme.spacing.sm,
            fontSize: 13,
            fontWeight:
                "700",
            color:
                theme.colors
                    .text,
        },

        inputWrapper: {
            minHeight: 52,
            flexDirection:
                "row",
            alignItems:
                "center",
            gap:
                theme.spacing.sm,
            paddingHorizontal:
                theme.spacing.md,
            borderRadius:
                theme.radius.md,
            borderWidth: 1,
            borderColor:
                theme.colors
                    .border,
            backgroundColor:
                theme.colors
                    .surface,
        },

        inputWrapperFocused: {
            borderColor:
                theme.colors
                    .borderStrong,
        },

        input: {
            flex: 1,
            minHeight: 50,
            color:
                theme.colors.text,
            fontSize: 15,
        },

        forgotButton: {
            alignSelf:
                "flex-end",
            marginTop:
                -theme.spacing.sm,
            marginBottom:
                theme.spacing.xl,
        },

        forgotText: {
            color:
                theme.colors
                    .text,
            fontSize: 13,
            fontWeight:
                "600",
        },

        loginButton: {
            height: 53,
            alignItems:
                "center",
            justifyContent:
                "center",
            borderRadius:
                theme.radius.md,
            backgroundColor:
                theme.colors
                    .primary,
        },

        loginButtonText: {
            color:
                theme.colors
                    .primaryText,
            fontSize: 15,
            fontWeight:
                "700",
        },

        buttonPressed: {
            opacity: 0.85,
            transform: [
                {
                    scale: 0.99,
                },
            ],
        },

        buttonDisabled: {
            opacity: 0.6,
        },

        registerRow: {
            flexDirection:
                "row",
            justifyContent:
                "center",
            alignItems:
                "center",
            gap:
                theme.spacing.xs,
            marginTop:
                theme.spacing.xl,
        },

        registerText: {
            color:
                theme.colors
                    .textSecondary,
            fontSize: 13,
        },

        registerLink: {
            color:
                theme.colors
                    .text,
            fontSize: 13,
            fontWeight:
                "700",
        },

        footer: {
            maxWidth: 360,
            alignSelf:
                "center",
            marginTop:
                theme.spacing.xl,
            textAlign:
                "center",
            color:
                theme.colors
                    .textMuted,
            fontSize: 11,
            lineHeight: 17,
        },
    });
}