import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";

import { SafeScreen } from "@/components/SafeScreen";
import { useTheme } from "@/theme";

export default function SettingsScreen() {
    const { theme } = useTheme();

    const [notificationsEnabled, setNotificationsEnabled] =
        useState(true);

    const [messageNotifications, setMessageNotifications] =
        useState(true);

    const [favoriteNotifications, setFavoriteNotifications] =
        useState(true);

    const styles = useMemo(
        () => createStyles(theme),
        [theme]
    );

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
                        Setări
                    </Text>

                    <View style={styles.headerSpacer} />
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                >
                    {/* ACCOUNT */}

                    <SectionTitle
                        title="Cont"
                        theme={theme}
                    />

                    <SettingsRow
                        icon="person-outline"
                        title="Editează profilul"
                        subtitle="Nume, fotografie și informații personale"
                        onPress={() =>
                            router.push("/edit-profile")
                        }
                        theme={theme}
                    />

                    <SettingsRow
                        icon="shield-checkmark-outline"
                        title="Securitate"
                        subtitle="Parolă și autentificare în doi pași"
                        onPress={() =>
                            router.push("/security")
                        }
                        theme={theme}
                    />

                    {/* NOTIFICATIONS */}

                    <SectionTitle
                        title="Notificări"
                        theme={theme}
                    />

                    <SwitchRow
                        icon="notifications-outline"
                        title="Notificări"
                        subtitle="Activează sau dezactivează notificările"
                        value={notificationsEnabled}
                        onValueChange={
                            setNotificationsEnabled
                        }
                        theme={theme}
                    />

                    <SwitchRow
                        icon="chatbubble-outline"
                        title="Mesaje"
                        subtitle="Primește notificări pentru mesaje noi"
                        value={
                            notificationsEnabled &&
                            messageNotifications
                        }
                        disabled={!notificationsEnabled}
                        onValueChange={
                            setMessageNotifications
                        }
                        theme={theme}
                    />

                    <SwitchRow
                        icon="heart-outline"
                        title="Favorite"
                        subtitle="Când cineva interacționează cu anunțurile tale"
                        value={
                            notificationsEnabled &&
                            favoriteNotifications
                        }
                        disabled={!notificationsEnabled}
                        onValueChange={
                            setFavoriteNotifications
                        }
                        theme={theme}
                    />

                    {/* PREFERENCES */}

                    <SectionTitle
                        title="Preferințe"
                        theme={theme}
                    />

                    <SettingsRow
                        icon="language-outline"
                        title="Limbă"
                        subtitle="Română"
                        onPress={() => {}}
                        theme={theme}
                    />

                    <SettingsRow
                        icon="cash-outline"
                        title="Monedă"
                        subtitle="RON — Lei"
                        onPress={() => {}}
                        theme={theme}
                    />

                    {/* PRIVACY */}

                    <SectionTitle
                        title="Confidențialitate"
                        theme={theme}
                    />

                    <SettingsRow
                        icon="lock-closed-outline"
                        title="Confidențialitate"
                        subtitle="Controlează modul în care sunt folosite datele tale"
                        onPress={() => {}}
                        theme={theme}
                    />

                    <SettingsRow
                        icon="eye-off-outline"
                        title="Utilizatori blocați"
                        subtitle="Gestionează utilizatorii blocați"
                        onPress={() => {}}
                        theme={theme}
                    />

                    {/* SUPPORT */}

                    <SectionTitle
                        title="Ajutor"
                        theme={theme}
                    />

                    <SettingsRow
                        icon="help-circle-outline"
                        title="Ajutor și suport"
                        subtitle="Întrebări frecvente și contact"
                        onPress={() => {}}
                        theme={theme}
                    />

                    <SettingsRow
                        icon="document-text-outline"
                        title="Termeni și condiții"
                        subtitle="Termenii de utilizare Nexora"
                        onPress={() => {}}
                        theme={theme}
                    />

                    <SettingsRow
                        icon="shield-outline"
                        title="Politica de confidențialitate"
                        subtitle="Cum protejăm datele tale"
                        onPress={() => {}}
                        theme={theme}
                    />

                    {/* VERSION */}

                    <Text style={styles.version}>
                        Nexora Store
                    </Text>

                    <Text style={styles.versionNumber}>
                        Versiunea 1.0.0
                    </Text>
                </ScrollView>
            </View>
        </SafeScreen>
    );
}

function SectionTitle({
    title,
    theme,
}: {
    title: string;
    theme: ReturnType<typeof useTheme>["theme"];
}) {
    return (
        <Text
            style={{
                marginTop: theme.spacing.lg,
                marginBottom: theme.spacing.sm,
                color: theme.colors.textSecondary,
                fontSize: 12,
                fontWeight: "800",
                textTransform: "uppercase",
                letterSpacing: 0.7,
            }}
        >
            {title}
        </Text>
    );
}

function SettingsRow({
    icon,
    title,
    subtitle,
    onPress,
    theme,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    theme: ReturnType<typeof useTheme>["theme"];
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                {
                    flexDirection: "row",
                    alignItems: "center",
                    minHeight: 68,
                    paddingHorizontal: 4,
                    borderBottomWidth: 1,
                    borderBottomColor:
                        theme.colors.border,
                    opacity: pressed ? 0.65 : 1,
                },
            ]}
        >
            <View
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                        theme.colors.primarySoft,
                }}
            >
                <Ionicons
                    name={icon}
                    size={21}
                    color={theme.colors.primary}
                />
            </View>

            <View
                style={{
                    flex: 1,
                    marginLeft: theme.spacing.md,
                }}
            >
                <Text
                    style={{
                        color: theme.colors.text,
                        fontSize: 14,
                        fontWeight: "700",
                    }}
                >
                    {title}
                </Text>

                {subtitle ? (
                    <Text
                        numberOfLines={2}
                        style={{
                            marginTop: 3,
                            color:
                                theme.colors.textSecondary,
                            fontSize: 12,
                            lineHeight: 17,
                        }}
                    >
                        {subtitle}
                    </Text>
                ) : null}
            </View>

            <Ionicons
                name="chevron-forward"
                size={18}
                color={theme.colors.textMuted}
            />
        </Pressable>
    );
}

function SwitchRow({
    icon,
    title,
    subtitle,
    value,
    disabled,
    onValueChange,
    theme,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    value: boolean;
    disabled?: boolean;
    onValueChange: (value: boolean) => void;
    theme: ReturnType<typeof useTheme>["theme"];
}) {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                minHeight: 68,
                paddingHorizontal: 4,
                borderBottomWidth: 1,
                borderBottomColor:
                    theme.colors.border,
                opacity: disabled ? 0.45 : 1,
            }}
        >
            <View
                style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor:
                        theme.colors.primarySoft,
                }}
            >
                <Ionicons
                    name={icon}
                    size={21}
                    color={theme.colors.primary}
                />
            </View>

            <View
                style={{
                    flex: 1,
                    marginLeft: theme.spacing.md,
                    marginRight: theme.spacing.sm,
                }}
            >
                <Text
                    style={{
                        color: theme.colors.text,
                        fontSize: 14,
                        fontWeight: "700",
                    }}
                >
                    {title}
                </Text>

                {subtitle ? (
                    <Text
                        numberOfLines={2}
                        style={{
                            marginTop: 3,
                            color:
                                theme.colors.textSecondary,
                            fontSize: 12,
                            lineHeight: 17,
                        }}
                    >
                        {subtitle}
                    </Text>
                ) : null}
            </View>

            <Switch
                value={value}
                disabled={disabled}
                onValueChange={onValueChange}
                trackColor={{
                    false: theme.colors.border,
                    true: theme.colors.primarySoft,
                }}
                thumbColor={
                    value
                        ? theme.colors.primary
                        : theme.colors.textMuted
                }
            />
        </View>
    );
}

function createStyles(
    theme: ReturnType<typeof useTheme>["theme"]
) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },

        header: {
            minHeight: 62,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: theme.spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
            backgroundColor: theme.colors.surface,
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
            paddingHorizontal: theme.spacing.md,
            paddingBottom: 40,
        },

        version: {
            marginTop: theme.spacing.xl,
            textAlign: "center",
            color: theme.colors.text,
            fontSize: 13,
            fontWeight: "800",
        },

        versionNumber: {
            marginTop: 4,
            textAlign: "center",
            color: theme.colors.textMuted,
            fontSize: 11,
        },
    });
}