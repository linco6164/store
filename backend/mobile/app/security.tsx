import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { SafeScreen } from "@/components/SafeScreen";
import { useTheme } from "@/theme";

export default function SecurityScreen() {
    const { theme } = useTheme();

    const styles = useMemo(
        () => createStyles(theme),
        [theme]
    );

    const [currentPassword, setCurrentPassword] =
        useState("");

    const [newPassword, setNewPassword] =
        useState("");

    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showCurrent, setShowCurrent] =
        useState(false);

    const [showNew, setShowNew] =
        useState(false);

    const [showConfirm, setShowConfirm] =
        useState(false);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    async function handleChangePassword() {
        if (saving) {
            return;
        }

        setError("");
        setSuccess("");

        if (!currentPassword) {
            setError(
                "Introdu parola actuală."
            );
            return;
        }

        if (!newPassword) {
            setError(
                "Introdu noua parolă."
            );
            return;
        }

        if (newPassword.length < 8) {
            setError(
                "Noua parolă trebuie să conțină cel puțin 8 caractere."
            );
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(
                "Parolele nu coincid."
            );
            return;
        }

        try {
            setSaving(true);

            /*
             * Endpoint-ul real pentru schimbarea parolei
             * va fi conectat după stabilirea contractului
             * final al backend-ului.
             */

            await new Promise((resolve) =>
                setTimeout(resolve, 600)
            );

            setSuccess(
                "Parola a fost schimbată cu succes."
            );

            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (changeError) {
            console.error(
                "Failed to change password:",
                changeError
            );

            setError(
                "Nu am putut schimba parola."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <SafeScreen>
            <View style={styles.container}>
                {/* HEADER */}

                <View style={styles.header}>
                    <Pressable
                        onPress={() => router.back()}
                        style={styles.headerButton}
                        hitSlop={8}
                    >
                        <Ionicons
                            name="arrow-back"
                            size={24}
                            color={
                                theme.colors.text
                            }
                        />
                    </Pressable>

                    <Text style={styles.headerTitle}>
                        Securitate
                    </Text>

                    <View
                        style={
                            styles.headerSpacer
                        }
                    />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={
                        false
                    }
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={
                        styles.content
                    }
                >
                    {/* SECURITY HEADER */}

                    <View
                        style={
                            styles.securityHero
                        }
                    >
                        <View
                            style={
                                styles.securityIcon
                            }
                        >
                            <Ionicons
                                name="shield-checkmark-outline"
                                size={32}
                                color={
                                    theme.colors
                                        .primary
                                }
                            />
                        </View>

                        <Text
                            style={
                                styles.heroTitle
                            }
                        >
                            Protejează-ți contul
                        </Text>

                        <Text
                            style={
                                styles.heroText
                            }
                        >
                            Folosește o parolă puternică
                            și unică pentru a-ți păstra
                            contul Nexora în siguranță.
                        </Text>
                    </View>

                    {/* PASSWORD */}

                    <Text
                        style={
                            styles.sectionTitle
                        }
                    >
                        Schimbă parola
                    </Text>

                    <PasswordField
                        label="Parola actuală"
                        value={
                            currentPassword
                        }
                        onChangeText={
                            setCurrentPassword
                        }
                        visible={
                            showCurrent
                        }
                        onToggle={() =>
                            setShowCurrent(
                                (value) =>
                                    !value
                            )
                        }
                        theme={theme}
                    />

                    <PasswordField
                        label="Parola nouă"
                        value={newPassword}
                        onChangeText={
                            setNewPassword
                        }
                        visible={showNew}
                        onToggle={() =>
                            setShowNew(
                                (value) =>
                                    !value
                            )
                        }
                        theme={theme}
                    />

                    <PasswordField
                        label="Confirmă parola nouă"
                        value={
                            confirmPassword
                        }
                        onChangeText={
                            setConfirmPassword
                        }
                        visible={
                            showConfirm
                        }
                        onToggle={() =>
                            setShowConfirm(
                                (value) =>
                                    !value
                            )
                        }
                        theme={theme}
                    />

                    {/* PASSWORD RULES */}

                    <View
                        style={
                            styles.rulesBox
                        }
                    >
                        <Text
                            style={
                                styles.rulesTitle
                            }
                        >
                            Recomandări pentru parolă
                        </Text>

                        <PasswordRule
                            valid={
                                newPassword.length >=
                                8
                            }
                            text="Cel puțin 8 caractere"
                            theme={theme}
                        />

                        <PasswordRule
                            valid={
                                /[A-Z]/.test(
                                    newPassword
                                )
                            }
                            text="Cel puțin o literă mare"
                            theme={theme}
                        />

                        <PasswordRule
                            valid={
                                /[0-9]/.test(
                                    newPassword
                                )
                            }
                            text="Cel puțin o cifră"
                            theme={theme}
                        />

                        <PasswordRule
                            valid={
                                newPassword.length >
                                    0 &&
                                newPassword ===
                                    confirmPassword
                            }
                            text="Parolele coincid"
                            theme={theme}
                        />
                    </View>

                    {/* FEEDBACK */}

                    {error ? (
                        <View
                            style={
                                styles.errorBox
                            }
                        >
                            <Ionicons
                                name="alert-circle-outline"
                                size={19}
                                color="#ef4444"
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

                    {success ? (
                        <View
                            style={
                                styles.successBox
                            }
                        >
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={19}
                                color={
                                    theme.colors
                                        .primary
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

                    {/* SAVE */}

                    <Pressable
                        onPress={
                            handleChangePassword
                        }
                        disabled={saving}
                        style={({
                            pressed,
                        }) => [
                            styles.saveButton,
                            {
                                opacity:
                                    pressed ||
                                    saving
                                        ? 0.75
                                        : 1,
                            },
                        ]}
                    >
                        {saving ? (
                            <ActivityIndicator
                                size="small"
                                color={
                                    theme.colors
                                        .primaryText
                                }
                            />
                        ) : (
                            <>
                                <Ionicons
                                    name="lock-closed-outline"
                                    size={19}
                                    color={
                                        theme.colors
                                            .primaryText
                                    }
                                />

                                <Text
                                    style={
                                        styles.saveButtonText
                                    }
                                >
                                    Schimbă parola
                                </Text>
                            </>
                        )}
                    </Pressable>

                    {/* ADDITIONAL SECURITY */}

                    <Text
                        style={
                            styles.sectionTitleSecondary
                        }
                    >
                        Alte opțiuni
                    </Text>

                    <SecurityRow
                        icon="phone-portrait-outline"
                        title="Autentificare în doi pași"
                        description="Adaugă un nivel suplimentar de protecție."
                        onPress={() => {}}
                        theme={theme}
                    />

                    <SecurityRow
                        icon="log-out-outline"
                        title="Sesiuni active"
                        description="Vezi dispozitivele conectate la cont."
                        onPress={() => {}}
                        theme={theme}
                    />

                    <SecurityRow
                        icon="key-outline"
                        title="Chei de acces"
                        description="Folosește passkeys pentru autentificare."
                        onPress={() => {}}
                        theme={theme}
                    />
                </ScrollView>
            </View>
        </SafeScreen>
    );
}

function PasswordField({
    label,
    value,
    onChangeText,
    visible,
    onToggle,
    theme,
}: {
    label: string;
    value: string;
    onChangeText: (
        value: string
    ) => void;
    visible: boolean;
    onToggle: () => void;
    theme: ReturnType<
        typeof useTheme
    >["theme"];
}) {
    return (
        <View
            style={{
                marginBottom:
                    theme.spacing.md,
            }}
        >
            <Text
                style={{
                    marginBottom: 7,
                    color: theme.colors.text,
                    fontSize: 13,
                    fontWeight: "700",
                }}
            >
                {label}
            </Text>

            <View
                style={{
                    minHeight: 50,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingLeft: 13,
                    borderWidth: 1,
                    borderColor:
                        theme.colors.border,
                    borderRadius: 13,
                    backgroundColor:
                        theme.colors.surface,
                }}
            >
                <Ionicons
                    name="lock-closed-outline"
                    size={19}
                    color={
                        theme.colors.textMuted
                    }
                />

                <TextInput
                    value={value}
                    onChangeText={
                        onChangeText
                    }
                    secureTextEntry={
                        !visible
                    }
                    placeholder="Introdu parola"
                    placeholderTextColor={
                        theme.colors.textMuted
                    }
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={{
                        flex: 1,
                        height: 48,
                        marginLeft: 10,
                        color:
                            theme.colors.text,
                        fontSize: 14,
                    }}
                />

                <Pressable
                    onPress={onToggle}
                    style={{
                        width: 48,
                        height: 48,
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                    }}
                    hitSlop={8}
                >
                    <Ionicons
                        name={
                            visible
                                ? "eye-off-outline"
                                : "eye-outline"
                        }
                        size={20}
                        color={
                            theme.colors
                                .textMuted
                        }
                    />
                </Pressable>
            </View>
        </View>
    );
}

function PasswordRule({
    valid,
    text,
    theme,
}: {
    valid: boolean;
    text: string;
    theme: ReturnType<
        typeof useTheme
    >["theme"];
}) {
    return (
        <View
            style={
                stylesForRule.row
            }
        >
            <Ionicons
                name={
                    valid
                        ? "checkmark-circle"
                        : "ellipse-outline"
                }
                size={17}
                color={
                    valid
                        ? theme.colors.primary
                        : theme.colors.textMuted
                }
            />

            <Text
                style={{
                    color: valid
                        ? theme.colors.text
                        : theme.colors.textSecondary,
                    fontSize: 12,
                    marginLeft: 8,
                }}
            >
                {text}
            </Text>
        </View>
    );
}

function SecurityRow({
    icon,
    title,
    description,
    onPress,
    theme,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    onPress: () => void;
    theme: ReturnType<
        typeof useTheme
    >["theme"];
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => ({
                minHeight: 70,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 14,
                marginBottom: 9,
                borderRadius: 14,
                borderWidth: 1,
                borderColor:
                    theme.colors.border,
                backgroundColor:
                    theme.colors.surface,
                opacity: pressed
                    ? 0.7
                    : 1,
            })}
        >
            <View
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                        theme.colors
                            .surfaceSecondary,
                }}
            >
                <Ionicons
                    name={icon}
                    size={20}
                    color={
                        theme.colors.primary
                    }
                />
            </View>

            <View
                style={{
                    flex: 1,
                    marginLeft: 12,
                }}
            >
                <Text
                    style={{
                        color:
                            theme.colors.text,
                        fontSize: 14,
                        fontWeight: "700",
                    }}
                >
                    {title}
                </Text>

                <Text
                    numberOfLines={2}
                    style={{
                        marginTop: 3,
                        color:
                            theme.colors
                                .textSecondary,
                        fontSize: 11,
                        lineHeight: 16,
                    }}
                >
                    {description}
                </Text>
            </View>

            <Ionicons
                name="chevron-forward"
                size={19}
                color={
                    theme.colors.textMuted
                }
            />
        </Pressable>
    );
}

const stylesForRule = StyleSheet.create({
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 9,
    },
});

function createStyles(
    theme: ReturnType<
        typeof useTheme
    >["theme"]
) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor:
                theme.colors.background,
        },

        header: {
            minHeight: 62,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal:
                theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor:
                theme.colors.border,
            backgroundColor:
                theme.colors.surface,
        },

        headerButton: {
            width: 44,
            height: 44,
            alignItems: "center",
            justifyContent: "center",
        },

        headerTitle: {
            flex: 1,
            textAlign: "center",
            color: theme.colors.text,
            fontSize: 17,
            fontWeight: "800",
        },

        headerSpacer: {
            width: 44,
        },

        content: {
            paddingHorizontal:
                theme.spacing.md,
            paddingBottom: 40,
        },

        securityHero: {
            alignItems: "center",
            paddingTop: 28,
            paddingBottom: 26,
        },

        securityIcon: {
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
                theme.colors.primarySoft,
        },

        heroTitle: {
            marginTop: 15,
            color: theme.colors.text,
            fontSize: 20,
            fontWeight: "800",
        },

        heroText: {
            maxWidth: 330,
            marginTop: 7,
            color:
                theme.colors.textSecondary,
            textAlign: "center",
            fontSize: 12,
            lineHeight: 18,
        },

        sectionTitle: {
            marginBottom: theme.spacing.md,
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: "800",
        },

        rulesBox: {
            marginBottom: theme.spacing.md,
            padding: 14,
            borderRadius: 13,
            backgroundColor:
                theme.colors.surfaceSecondary,
        },

        rulesTitle: {
            color: theme.colors.text,
            fontSize: 12,
            fontWeight: "800",
        },

        errorBox: {
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            marginBottom: theme.spacing.md,
            borderRadius: 12,
            backgroundColor:
                theme.colors.surfaceSecondary,
            gap: 8,
        },

        errorText: {
            flex: 1,
            color: "#ef4444",
            fontSize: 13,
            lineHeight: 18,
        },

        successBox: {
            flexDirection: "row",
            alignItems: "center",
            padding: 12,
            marginBottom: theme.spacing.md,
            borderRadius: 12,
            backgroundColor:
                theme.colors.primarySoft,
            gap: 8,
        },

        successText: {
            flex: 1,
            color:
                theme.colors.primary,
            fontSize: 13,
            lineHeight: 18,
            fontWeight: "600",
        },

        saveButton: {
            minHeight: 52,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            backgroundColor:
                theme.colors.primary,
            gap: 8,
        },

        saveButtonText: {
            color:
                theme.colors.primaryText,
            fontSize: 14,
            fontWeight: "800",
        },

        sectionTitleSecondary: {
            marginTop: 30,
            marginBottom: 12,
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: "800",
        },
    });
}