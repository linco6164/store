import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
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

export default function ProfileScreen() {
    const { theme } =
        useTheme();

    const {
        user,
        loading,
        logout,
    } = useAuth();

    const styles =
        createStyles(theme);

    async function handleLogout() {
        await logout();
    }

    if (loading) {
        return (
            <View
                style={
                    styles.loadingContainer
                }
            >
                <View
                    style={
                        styles.loadingCircle
                    }
                >
                    <Ionicons
                        name="person-outline"
                        size={26}
                        color={
                            theme
                                .colors
                                .primary
                        }
                    />
                </View>

                <Text
                    style={
                        styles.loadingText
                    }
                >
                    Loading profile...
                </Text>
            </View>
        );
    }

    return (
        <View
            style={
                styles.container
            }
        >
            <ScrollView
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.content
                }
            >
                {/* HEADER */}

                <View
                    style={
                        styles.header
                    }
                >
                    <View>
                        <Text
                            style={
                                styles.title
                            }
                        >
                            Profile
                        </Text>

                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Contul tău Nexora
                        </Text>
                    </View>

                    <Pressable
                        style={
                            styles.settingsButton
                        }
                        onPress={() =>
                            router.push(
                                "/settings"
                            )
                        }
                    >
                        <Ionicons
                            name="settings-outline"
                            size={21}
                            color={
                                theme
                                    .colors
                                    .text
                            }
                        />
                    </Pressable>
                </View>

                {/* PROFILE CARD */}

                <View
                    style={
                        styles.profileCard
                    }
                >
                    <View
                        style={
                            styles.avatar
                        }
                    >
                        {user?.avatar ? (
                            // Image-ul real îl conectăm
                            // când avem componenta
                            // de avatar.
                            <Ionicons
                                name="person"
                                size={30}
                                color={
                                    theme
                                        .colors
                                        .primary
                                }
                            />
                        ) : (
                            <Text
                                style={
                                    styles.avatarText
                                }
                            >
                                {getInitial(
                                    user?.username
                                )}
                            </Text>
                        )}
                    </View>

                    <View
                        style={
                            styles.profileInfo
                        }
                    >
                        <View
                            style={
                                styles.nameRow
                            }
                        >
                            <Text
                                numberOfLines={
                                    1
                                }
                                style={
                                    styles.name
                                }
                            >
                                {user?.username ||
                                    "Nexora User"}
                            </Text>

                            {user?.verified ? (
                                <Ionicons
                                    name="checkmark-circle"
                                    size={18}
                                    color={
                                        theme
                                            .colors
                                            .primary
                                    }
                                />
                            ) : null}
                        </View>

                        <Text
                            numberOfLines={
                                1
                            }
                            style={
                                styles.email
                            }
                        >
                            {user?.email ||
                                "No email"}
                        </Text>

                        {user?.city ? (
                            <View
                                style={
                                    styles.location
                                }
                            >
                                <Ionicons
                                    name="location-outline"
                                    size={14}
                                    color={
                                        theme
                                            .colors
                                            .textMuted
                                    }
                                />

                                <Text
                                    style={
                                        styles.locationText
                                    }
                                >
                                    {
                                        user.city
                                    }
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    <Pressable
                        style={
                            styles.editButton
                        }
                        onPress={() =>
                            router.push(
                                "/edit-profile"
                            )
                        }
                    >
                        <Ionicons
                            name="pencil-outline"
                            size={18}
                            color={
                                theme
                                    .colors
                                    .text
                            }
                        />
                    </Pressable>
                </View>

                {/* QUICK STATS */}

                <View
                    style={
                        styles.stats
                    }
                >
                    <Stat
                        icon="bag-outline"
                        value="0"
                        label="Listings"
                        theme={theme}
                    />

                    <View
                        style={
                            styles.statDivider
                        }
                    />

                    <Stat
                        icon="heart-outline"
                        value="0"
                        label="Favorites"
                        theme={theme}
                    />

                    <View
                        style={
                            styles.statDivider
                        }
                    />

                    <Stat
                        icon="star-outline"
                        value="0.0"
                        label="Rating"
                        theme={theme}
                    />
                </View>

                {/* ACCOUNT */}

                <SectionTitle
                    title="Account"
                    theme={theme}
                />

                <View
                    style={
                        styles.menu
                    }
                >
                    <MenuItem
                        icon="person-outline"
                        title="Edit profile"
                        subtitle="Nume, fotografie și informații"
                        onPress={() =>
                            router.push(
                                "/edit-profile"
                            )
                        }
                        theme={theme}
                    />

                    <MenuItem
                        icon="shield-checkmark-outline"
                        title="Security"
                        subtitle="Parolă și autentificare 2FA"
                        onPress={() =>
                            router.push(
                                "/security"
                            )
                        }
                        theme={theme}
                    />

                    <MenuItem
                        icon="notifications-outline"
                        title="Notifications"
                        subtitle="Gestionează notificările"
                        onPress={() =>
                            router.push(
                                "/notifications"
                            )
                        }
                        theme={theme}
                    />

                    <MenuItem
                        icon="location-outline"
                        title="Addresses"
                        subtitle="Adresele tale de livrare"
                        onPress={() => {}}
                        theme={theme}
                    />
                </View>

                {/* ACTIVITY */}

                <SectionTitle
                    title="Activity"
                    theme={theme}
                />

                <View
                    style={
                        styles.menu
                    }
                >
                    <MenuItem
                        icon="cube-outline"
                        title="My listings"
                        subtitle="Produsele puse la vânzare"
                        onPress={() => {}}
                        theme={theme}
                    />

                    <MenuItem
                        icon="heart-outline"
                        title="Favorites"
                        subtitle="Produsele salvate"
                        onPress={() => {}}
                        theme={theme}
                    />

                    <MenuItem
                        icon="receipt-outline"
                        title="Orders"
                        subtitle="Comenzile tale"
                        onPress={() => {}}
                        theme={theme}
                    />
                </View>

                {/* SUPPORT */}

                <SectionTitle
                    title="Support"
                    theme={theme}
                />

                <View
                    style={
                        styles.menu
                    }
                >
                    <MenuItem
                        icon="help-circle-outline"
                        title="Help center"
                        subtitle="Ai nevoie de ajutor?"
                        onPress={() => {}}
                        theme={theme}
                    />

                    <MenuItem
                        icon="document-text-outline"
                        title="Terms & policies"
                        subtitle="Termeni și politica Nexora"
                        onPress={() => {}}
                        theme={theme}
                    />
                </View>

                {/* LOGOUT */}

                <Pressable
                    onPress={
                        handleLogout
                    }
                    style={({ pressed }) => [
                        styles.logoutButton,
                        pressed &&
                            styles.pressed,
                    ]}
                >
                    <Ionicons
                        name="log-out-outline"
                        size={20}
                        color={
                            theme
                                .colors
                                .danger
                        }
                    />

                    <Text
                        style={
                            styles.logoutText
                        }
                    >
                        Log out
                    </Text>
                </Pressable>

                <Text
                    style={
                        styles.version
                    }
                >
                    Nexora Mobile • v1.0.0
                </Text>
            </ScrollView>
        </View>
    );
}

function getInitial(
    username?: string
) {
    if (!username) {
        return "N";
    }

    return username
        .trim()
        .charAt(0)
        .toUpperCase();
}

function Stat({
    icon,
    value,
    label,
    theme,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    label: string;
    theme: ReturnType<
        typeof useTheme
    >["theme"];
}) {
    return (
        <View
            style={{
                flex: 1,
                alignItems: "center",
            }}
        >
            <Ionicons
                name={icon}
                size={20}
                color={
                    theme.colors.primary
                }
            />

            <Text
                style={{
                    marginTop:
                        theme.spacing.xs,
                    color:
                        theme.colors.text,
                    fontSize: 17,
                    fontWeight: "800",
                }}
            >
                {value}
            </Text>

            <Text
                style={{
                    marginTop: 2,
                    color:
                        theme.colors
                            .textMuted,
                    fontSize: 10,
                    fontWeight: "600",
                }}
            >
                {label}
            </Text>
        </View>
    );
}

function SectionTitle({
    title,
    theme,
}: {
    title: string;
    theme: ReturnType<
        typeof useTheme
    >["theme"];
}) {
    return (
        <Text
            style={{
                marginTop:
                    theme.spacing["2xl"],
                marginBottom:
                    theme.spacing.md,
                color:
                    theme.colors.text,
                fontSize: 17,
                fontWeight: "800",
            }}
        >
            {title}
        </Text>
    );
}

function MenuItem({
    icon,
    title,
    subtitle,
    onPress,
    theme,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle: string;
    onPress: () => void;
    theme: ReturnType<
        typeof useTheme
    >["theme"];
}) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                {
                    minHeight: 68,
                    flexDirection:
                        "row",
                    alignItems:
                        "center",
                    paddingHorizontal:
                        theme.spacing.md,
                    borderBottomWidth:
                        1,
                    borderBottomColor:
                        theme.colors
                            .border,
                },

                pressed && {
                    opacity: 0.7,
                },
            ]}
        >
            <View
                style={{
                    width: 40,
                    height: 40,
                    borderRadius:
                        theme.radius.md,
                    alignItems:
                        "center",
                    justifyContent:
                        "center",
                    backgroundColor:
                        theme.colors
                            .surfaceSecondary,
                }}
            >
                <Ionicons
                    name={icon}
                    size={20}
                    color={
                        theme.colors
                            .textSecondary
                    }
                />
            </View>

            <View
                style={{
                    flex: 1,
                    marginLeft:
                        theme.spacing.md,
                }}
            >
                <Text
                    style={{
                        color:
                            theme.colors
                                .text,
                        fontSize: 14,
                        fontWeight:
                            "700",
                    }}
                >
                    {title}
                </Text>

                <Text
                    numberOfLines={1}
                    style={{
                        marginTop: 3,
                        color:
                            theme.colors
                                .textMuted,
                        fontSize: 11,
                    }}
                >
                    {subtitle}
                </Text>
            </View>

            <Ionicons
                name="chevron-forward"
                size={17}
                color={
                    theme.colors
                        .textMuted
                }
            />
        </Pressable>
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
            paddingHorizontal:
                theme.spacing.lg,
            paddingTop:
                theme.spacing.xl,
            paddingBottom:
                theme.spacing["5xl"],
        },

        header: {
            flexDirection:
                "row",
            alignItems:
                "center",
            justifyContent:
                "space-between",
            marginBottom:
                theme.spacing.xl,
        },

        title: {
            color:
                theme.colors.text,
            fontSize: 30,
            fontWeight:
                "900",
            letterSpacing:
                -0.8,
        },

        subtitle: {
            marginTop:
                theme.spacing.xs,
            color:
                theme.colors
                    .textSecondary,
            fontSize: 14,
        },

        settingsButton: {
            width: 44,
            height: 44,
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

        profileCard: {
            flexDirection:
                "row",
            alignItems:
                "center",
            padding:
                theme.spacing.lg,
            borderRadius:
                theme.radius.xl,
            backgroundColor:
                theme.colors.surface,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        avatar: {
            width: 64,
            height: 64,
            borderRadius: 32,
            alignItems:
                "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors.primarySoft,
        },

        avatarText: {
            color:
                theme.colors.primaryDark,
            fontSize: 24,
            fontWeight: "900",
        },

        profileInfo: {
            flex: 1,
            marginLeft:
                theme.spacing.md,
        },

        nameRow: {
            flexDirection:
                "row",
            alignItems:
                "center",
            gap:
                theme.spacing.xs,
        },

        name: {
            maxWidth: "80%",
            color:
                theme.colors.text,
            fontSize: 17,
            fontWeight: "800",
        },

        email: {
            marginTop: 3,
            color:
                theme.colors
                    .textSecondary,
            fontSize: 12,
        },

        location: {
            flexDirection:
                "row",
            alignItems:
                "center",
            gap: 3,
            marginTop: 5,
        },

        locationText: {
            color:
                theme.colors.textMuted,
            fontSize: 11,
        },

        editButton: {
            width: 38,
            height: 38,
            borderRadius:
                theme.radius.full,
            alignItems:
                "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors
                    .surfaceSecondary,
        },

        stats: {
            flexDirection:
                "row",
            alignItems:
                "center",
            marginTop:
                theme.spacing.lg,
            paddingVertical:
                theme.spacing.lg,
            borderRadius:
                theme.radius.xl,
            backgroundColor:
                theme.colors.surface,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        statDivider: {
            width: 1,
            height: 38,
            backgroundColor:
                theme.colors.border,
        },

        menu: {
            overflow: "hidden",
            borderRadius:
                theme.radius.xl,
            backgroundColor:
                theme.colors.surface,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        logoutButton: {
            height: 52,
            flexDirection:
                "row",
            alignItems:
                "center",
            justifyContent:
                "center",
            gap:
                theme.spacing.sm,
            marginTop:
                theme.spacing["2xl"],
            borderRadius:
                theme.radius.lg,
            backgroundColor:
                theme.colors
                    .dangerBackground,
            borderWidth: 1,
            borderColor:
                theme.colors.danger,
        },

        logoutText: {
            color:
                theme.colors.danger,
            fontSize: 14,
            fontWeight: "800",
        },

        pressed: {
            opacity: 0.75,
            transform: [
                {
                    scale: 0.99,
                },
            ],
        },

        version: {
            marginTop:
                theme.spacing.xl,
            textAlign: "center",
            color:
                theme.colors.textMuted,
            fontSize: 10,
        },

        loadingContainer: {
            flex: 1,
            alignItems:
                "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors
                    .background,
        },

        loadingCircle: {
            width: 60,
            height: 60,
            borderRadius: 30,
            alignItems:
                "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors
                    .primarySoft,
        },

        loadingText: {
            marginTop:
                theme.spacing.md,
            color:
                theme.colors
                    .textSecondary,
            fontSize: 13,
        },
    });
}