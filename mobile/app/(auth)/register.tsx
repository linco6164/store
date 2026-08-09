import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { router } from "expo-router";
import { useMemo, useState } from "react";
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

import { SafeScreen } from "@/components/SafeScreen";
import { useTheme } from "@/theme";

export default function RegisterScreen() {
    const { theme } = useTheme();

    const styles = useMemo(
        () => createStyles(theme),
        [theme]
    );

    const [username, setUsername] =
        useState("");

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] =
        useState(false);

    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    async function handleRegister() {
        setError("");
        setSuccess("");

        const cleanUsername =
            username.trim();

        const cleanEmail =
            email.trim().toLowerCase();

        if (
            !cleanUsername ||
            !cleanEmail ||
            !password ||
            !confirmPassword
        ) {
            setError(
                "Completează toate câmpurile."
            );
            return;
        }

        if (cleanUsername.length < 3) {
            setError(
                "Username-ul trebuie să aibă cel puțin 3 caractere."
            );
            return;
        }

        if (password.length < 6) {
            setError(
                "Parola trebuie să aibă cel puțin 6 caractere."
            );
            return;
        }

        if (
            password !==
            confirmPassword
        ) {
            setError(
                "Parolele nu coincid."
            );
            return;
        }

        const apiUrl =
            process.env
                .EXPO_PUBLIC_API_URL;

        if (!apiUrl) {
            setError(
                "URL-ul backendului nu este configurat."
            );
            return;
        }

        try {
            setLoading(true);

            const response =
                await axios.post(
                    `${apiUrl}/register`,
                    {
                        username:
                            cleanUsername,
                        email:
                            cleanEmail,
                        password,
                    },
                    {
                        timeout: 30000,
                    }
                );

            console.log(
                "Register response:",
                response.data
            );

            setSuccess(
                "Contul a fost creat cu succes."
            );

            setTimeout(() => {
                router.replace(
                    "/(auth)/login"
                );
            }, 1000);
        } catch (error) {
            console.error(
                "Register error:",
                error
            );

            if (
                axios.isAxiosError(
                    error
                )
            ) {
                const message =
                    error.response?.data
                        ?.message;

                setError(
                    message ||
                        "Nu am putut crea contul."
                );
            } else {
                setError(
                    "A apărut o eroare. Încearcă din nou."
                );
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <SafeScreen
            edges={[
                "top",
                "left",
                "right",
                "bottom",
            ]}
        >
            <KeyboardAvoidingView
                style={
                    styles.container
                }
                behavior={
                    Platform.OS ===
                    "ios"
                        ? "padding"
                        : undefined
                }
            >
                <ScrollView
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.content
                    }
                >
                    {/* BACK */}

                    <Pressable
                        onPress={() =>
                            router.back()
                        }
                        style={
                            styles.backButton
                        }
                    >
                        <Ionicons
                            name="arrow-back"
                            size={21}
                            color={
                                theme.colors
                                    .text
                            }
                        />
                    </Pressable>

                    {/* BRAND */}

                    <View
                        style={
                            styles.brandContainer
                        }
                    >
                        <Text
                            style={
                                styles.brand
                            }
                        >
                            nexora
                        </Text>

                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Create your account
                        </Text>
                    </View>

                    {/* USERNAME */}

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
                            Username
                        </Text>

                        <View
                            style={
                                styles.inputWrapper
                            }
                        >
                            <Ionicons
                                name="person-outline"
                                size={19}
                                color={
                                    theme
                                        .colors
                                        .textMuted
                                }
                            />

                            <TextInput
                                value={
                                    username
                                }
                                onChangeText={
                                    setUsername
                                }
                                placeholder="Choose a username"
                                placeholderTextColor={
                                    theme
                                        .colors
                                        .textMuted
                                }
                                autoCapitalize="none"
                                autoCorrect={
                                    false
                                }
                                style={
                                    styles.input
                                }
                            />
                        </View>
                    </View>

                    {/* EMAIL */}

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
                            style={
                                styles.inputWrapper
                            }
                        >
                            <Ionicons
                                name="mail-outline"
                                size={19}
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
                                placeholder="you@example.com"
                                placeholderTextColor={
                                    theme
                                        .colors
                                        .textMuted
                                }
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={
                                    false
                                }
                                style={
                                    styles.input
                                }
                            />
                        </View>
                    </View>

                    {/* PASSWORD */}

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
                            Password
                        </Text>

                        <View
                            style={
                                styles.inputWrapper
                            }
                        >
                            <Ionicons
                                name="lock-closed-outline"
                                size={19}
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
                                placeholder="Create a password"
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
                                style={
                                    styles.input
                                }
                            />

                            <Pressable
                                onPress={() =>
                                    setShowPassword(
                                        (value) =>
                                            !value
                                    )
                                }
                            >
                                <Ionicons
                                    name={
                                        showPassword
                                            ? "eye-off-outline"
                                            : "eye-outline"
                                    }
                                    size={20}
                                    color={
                                        theme
                                            .colors
                                            .textMuted
                                    }
                                />
                            </Pressable>
                        </View>
                    </View>

                    {/* CONFIRM PASSWORD */}

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
                            Confirm password
                        </Text>

                        <View
                            style={
                                styles.inputWrapper
                            }
                        >
                            <Ionicons
                                name="lock-closed-outline"
                                size={19}
                                color={
                                    theme
                                        .colors
                                        .textMuted
                                }
                            />

                            <TextInput
                                value={
                                    confirmPassword
                                }
                                onChangeText={
                                    setConfirmPassword
                                }
                                placeholder="Repeat your password"
                                placeholderTextColor={
                                    theme
                                        .colors
                                        .textMuted
                                }
                                secureTextEntry={
                                    !showConfirmPassword
                                }
                                autoCapitalize="none"
                                autoCorrect={
                                    false
                                }
                                style={
                                    styles.input
                                }
                            />

                            <Pressable
                                onPress={() =>
                                    setShowConfirmPassword(
                                        (value) =>
                                            !value
                                    )
                                }
                            >
                                <Ionicons
                                    name={
                                        showConfirmPassword
                                            ? "eye-off-outline"
                                            : "eye-outline"
                                    }
                                    size={20}
                                    color={
                                        theme
                                            .colors
                                            .textMuted
                                    }
                                />
                            </Pressable>
                        </View>
                    </View>

                    {/* ERROR */}

                    {error ? (
                        <View
                            style={
                                styles.messageError
                            }
                        >
                            <Ionicons
                                name="alert-circle-outline"
                                size={18}
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

                    {/* SUCCESS */}

                    {success ? (
                        <View
                            style={
                                styles.messageSuccess
                            }
                        >
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={18}
                                color={
                                    theme
                                        .colors
                                        .success
                                }
                            />

                            <Text
                                style={
                                    styles.successText
                                }
                            >
                                {success}
                            </Text>
                        </View>
                    ) : null}

                    {/* REGISTER */}

                    <Pressable
                        disabled={
                            loading
                        }
                        onPress={
                            handleRegister
                        }
                        style={({ pressed }) => [
                            styles.registerButton,
                            pressed &&
                                !loading &&
                                styles.buttonPressed,
                            loading &&
                                styles.buttonDisabled,
                        ]}
                    >
                        {loading ? (
                            <ActivityIndicator
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
                                        styles.registerButtonText
                                    }
                                >
                                    Create account
                                </Text>

                                <Ionicons
                                    name="arrow-forward"
                                    size={18}
                                    color={
                                        theme
                                            .colors
                                            .primaryText
                                    }
                                />
                            </>
                        )}
                    </Pressable>

                    {/* LOGIN */}

                    <View
                        style={
                            styles.loginRow
                        }
                    >
                        <Text
                            style={
                                styles.loginText
                            }
                        >
                            Already have an
                            account?
                        </Text>

                        <Pressable
                            onPress={() =>
                                router.replace(
                                    "/(auth)/login"
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.loginLink
                                }
                            >
                                Sign in
                            </Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeScreen>
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
            paddingHorizontal:
                theme.spacing.xl,
            paddingTop:
                theme.spacing.lg,
            paddingBottom:
                theme.spacing["3xl"],
        },

        backButton: {
            width: 42,
            height: 42,
            borderRadius:
                theme.radius.full,
            alignItems:
                "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors.surface,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        brandContainer: {
            marginTop:
                theme.spacing["2xl"],
            marginBottom:
                theme.spacing["2xl"],
        },

        brand: {
            color:
                theme.colors.text,
            fontSize: 38,
            fontWeight: "900",
            letterSpacing: -1.5,
        },

        subtitle: {
            marginTop:
                theme.spacing.sm,
            color:
                theme.colors
                    .textSecondary,
            fontSize: 15,
        },

        field: {
            marginBottom:
                theme.spacing.lg,
        },

        label: {
            marginBottom:
                theme.spacing.sm,
            color:
                theme.colors.text,
            fontSize: 13,
            fontWeight: "700",
        },

        inputWrapper: {
            height: 54,
            flexDirection:
                "row",
            alignItems:
                "center",
            gap:
                theme.spacing.sm,
            paddingHorizontal:
                theme.spacing.md,
            borderRadius:
                theme.radius.lg,
            backgroundColor:
                theme.colors.surface,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        input: {
            flex: 1,
            height: "100%",
            color:
                theme.colors.text,
            fontSize: 14,
        },

        messageError: {
            flexDirection:
                "row",
            alignItems:
                "center",
            gap:
                theme.spacing.sm,
            marginBottom:
                theme.spacing.md,
            padding:
                theme.spacing.md,
            borderRadius:
                theme.radius.lg,
            backgroundColor:
                theme.colors.surfaceSecondary,
        },

        errorText: {
            flex: 1,
            color:
                theme.colors.danger,
            fontSize: 12,
            lineHeight: 17,
        },

        messageSuccess: {
            flexDirection:
                "row",
            alignItems:
                "center",
            gap:
                theme.spacing.sm,
            marginBottom:
                theme.spacing.md,
            padding:
                theme.spacing.md,
            borderRadius:
                theme.radius.lg,
            backgroundColor:
                theme.colors.surfaceSecondary,
        },

        successText: {
            flex: 1,
            color:
                theme.colors.success,
            fontSize: 12,
            lineHeight: 17,
        },

        registerButton: {
            height: 54,
            flexDirection:
                "row",
            alignItems:
                "center",
            justifyContent:
                "center",
            gap:
                theme.spacing.sm,
            borderRadius:
                theme.radius.full,
            backgroundColor:
                theme.colors.primary,
        },

        buttonPressed: {
            opacity: 0.85,
        },

        buttonDisabled: {
            opacity: 0.65,
        },

        registerButtonText: {
            color:
                theme.colors
                    .primaryText,
            fontSize: 14,
            fontWeight: "900",
        },

        loginRow: {
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
        },

        loginText: {
            color:
                theme.colors
                    .textSecondary,
            fontSize: 12,
        },

        loginLink: {
            color:
                theme.colors.primary,
            fontSize: 12,
            fontWeight: "800",
        },
    });
}