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
import { Image } from "expo-image";

import { SafeScreen } from "@/components/SafeScreen";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/theme";

export default function EditProfileScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();

    const styles = useMemo(
        () => createStyles(theme),
        [theme]
    );

    const [username, setUsername] = useState(
        user?.username ?? ""
    );

    const [fullName, setFullName] = useState(
        (user as any)?.fullName ?? ""
    );

    const [bio, setBio] = useState(
        (user as any)?.bio ?? ""
    );

    const [phone, setPhone] = useState(
        (user as any)?.phone ?? ""
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSave() {
        if (saving) {
            return;
        }

        setError("");
        setSuccess("");

        if (!username.trim()) {
            setError("Numele de utilizator este obligatoriu.");
            return;
        }

        try {
            setSaving(true);

            /*
             * Momentan păstrăm UI-ul pregătit pentru API.
             *
             * Vom conecta aici endpoint-ul real de actualizare
             * profil după ce stabilim contractul backend-ului.
             */

            await new Promise((resolve) =>
                setTimeout(resolve, 500)
            );

            setSuccess("Profilul a fost actualizat.");

            setTimeout(() => {
                router.back();
            }, 700);
        } catch (saveError) {
            console.error(
                "Failed to update profile:",
                saveError
            );

            setError(
                "Nu am putut actualiza profilul."
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
                            color={theme.colors.text}
                        />
                    </Pressable>

                    <Text style={styles.headerTitle}>
                        Editează profilul
                    </Text>

                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={styles.content}
                >
                    {/* AVATAR */}

                    <View style={styles.avatarSection}>
                        <View style={styles.avatar}>
                            {user?.avatar ? (
                                <Image
                                    source={{
                                        uri: user.avatar,
                                    }}
                                    style={styles.avatarImage}
                                    contentFit="cover"
                                />
                            ) : (
                                <Ionicons
                                    name="person"
                                    size={42}
                                    color={
                                        theme.colors.textMuted
                                    }
                                />
                            )}
                        </View>

                        <Pressable
                            onPress={() => {}}
                            style={({ pressed }) => [
                                styles.changePhotoButton,
                                {
                                    opacity: pressed
                                        ? 0.65
                                        : 1,
                                },
                            ]}
                        >
                            <Ionicons
                                name="camera-outline"
                                size={17}
                                color={
                                    theme.colors.primary
                                }
                            />

                            <Text
                                style={
                                    styles.changePhotoText
                                }
                            >
                                Schimbă fotografia
                            </Text>
                        </Pressable>
                    </View>

                    {/* FORM */}

                    <Text style={styles.sectionTitle}>
                        Informații personale
                    </Text>

                    <Field
                        label="Nume utilizator"
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Numele tău de utilizator"
                        icon="at-outline"
                        theme={theme}
                        autoCapitalize="none"
                    />

                    <Field
                        label="Nume complet"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Numele și prenumele"
                        icon="person-outline"
                        theme={theme}
                    />

                    <Field
                        label="Telefon"
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Numărul de telefon"
                        icon="call-outline"
                        theme={theme}
                        keyboardType="phone-pad"
                    />

                    <Field
                        label="Descriere"
                        value={bio}
                        onChangeText={setBio}
                        placeholder="Spune câteva lucruri despre tine..."
                        icon="information-circle-outline"
                        theme={theme}
                        multiline
                        maxLength={300}
                    />

                    <Text style={styles.counter}>
                        {bio.length}/300
                    </Text>

                    {/* FEEDBACK */}

                    {error ? (
                        <View style={styles.errorBox}>
                            <Ionicons
                                name="alert-circle-outline"
                                size={19}
                                color="#ef4444"
                            />

                            <Text style={styles.errorText}>
                                {error}
                            </Text>
                        </View>
                    ) : null}

                    {success ? (
                        <View style={styles.successBox}>
                            <Ionicons
                                name="checkmark-circle-outline"
                                size={19}
                                color={theme.colors.primary}
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
                        onPress={handleSave}
                        disabled={saving}
                        style={({ pressed }) => [
                            styles.saveButton,
                            {
                                opacity:
                                    pressed || saving
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
                                    name="checkmark"
                                    size={20}
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
                                    Salvează modificările
                                </Text>
                            </>
                        )}
                    </Pressable>

                    <Text style={styles.infoText}>
                        Informațiile profilului tău pot fi
                        vizibile altor utilizatori Nexora.
                    </Text>
                </ScrollView>
            </View>
        </SafeScreen>
    );
}

function Field({
    label,
    value,
    onChangeText,
    placeholder,
    icon,
    theme,
    multiline = false,
    maxLength,
    keyboardType,
    autoCapitalize = "sentences",
}: {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    placeholder: string;
    icon: keyof typeof Ionicons.glyphMap;
    theme: ReturnType<typeof useTheme>["theme"];
    multiline?: boolean;
    maxLength?: number;
    keyboardType?: "default" | "phone-pad";
    autoCapitalize?: "none" | "sentences";
}) {
    return (
        <View style={{ marginBottom: theme.spacing.md }}>
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
                    flexDirection: "row",
                    alignItems: multiline
                        ? "flex-start"
                        : "center",
                    minHeight: multiline
                        ? 110
                        : 50,
                    paddingHorizontal: 13,
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                    borderRadius: 13,
                    backgroundColor:
                        theme.colors.surface,
                }}
            >
                <Ionicons
                    name={icon}
                    size={19}
                    color={theme.colors.textMuted}
                    style={{
                        marginTop: multiline ? 11 : 0,
                    }}
                />

                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={
                        theme.colors.textMuted
                    }
                    multiline={multiline}
                    maxLength={maxLength}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    style={{
                        flex: 1,
                        minHeight: multiline
                            ? 90
                            : 48,
                        marginLeft: 10,
                        paddingVertical: multiline
                            ? 10
                            : 0,
                        color: theme.colors.text,
                        fontSize: 14,
                        textAlignVertical:
                            multiline
                                ? "top"
                                : "center",
                    }}
                />
            </View>
        </View>
    );
}

function createStyles(
    theme: ReturnType<typeof useTheme>["theme"]
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

        avatarSection: {
            alignItems: "center",
            paddingVertical:
                theme.spacing.xl,
        },

        avatar: {
            width: 96,
            height: 96,
            borderRadius: 48,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            backgroundColor:
                theme.colors.surfaceSecondary,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        avatarImage: {
            width: "100%",
            height: "100%",
        },

        changePhotoButton: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: theme.spacing.md,
            gap: 6,
        },

        changePhotoText: {
            color: theme.colors.primary,
            fontSize: 13,
            fontWeight: "700",
        },

        sectionTitle: {
            marginBottom: theme.spacing.md,
            color: theme.colors.text,
            fontSize: 16,
            fontWeight: "800",
        },

        counter: {
            marginTop: -8,
            marginBottom: theme.spacing.md,
            textAlign: "right",
            color: theme.colors.textMuted,
            fontSize: 11,
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
            color: theme.colors.primary,
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

        infoText: {
            marginTop: theme.spacing.md,
            textAlign: "center",
            color: theme.colors.textMuted,
            fontSize: 11,
            lineHeight: 17,
        },
    });
}