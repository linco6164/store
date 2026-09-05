import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    ActivityIndicator,
    Alert,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import {
    SafeAreaView,
} from "react-native-safe-area-context";

import {
    router,
} from "expo-router";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    useTheme,
} from "@/theme";

import {
    type NotificationItem,
} from "@/services/notificationService";

import {
    useNotifications,
} from "@/context/NotificationContext";

export default function NotificationsScreen() {
    const { theme } =
        useTheme();

    const styles =
        createStyles(theme);

    const {
        notifications,
        unreadCount,
        loading,
        refresh,
        markAsRead,
        markAllAsRead,
        remove,
    } = useNotifications();

    const [refreshing, setRefreshing] =
        useState(false);

    const [actionLoading, setActionLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    /**
     * Initial refresh.
     *
     * NotificationContext already loads
     * notifications after authentication,
     * but refreshing here guarantees that
     * this screen has the latest data.
     */
    useEffect(() => {
        let mounted = true;

        const load = async () => {
            try {
                setError("");

                await refresh();
            } catch (error) {
                console.error(
                    "Failed to load notifications:",
                    error
                );

                if (mounted) {
                    setError(
                        "Nu am putut încărca notificările."
                    );
                }
            }
        };

        void load();

        return () => {
            mounted = false;
        };
    }, [refresh]);

    /**
     * Pull to refresh.
     */
    const handleRefresh =
        useCallback(async () => {
            try {
                setRefreshing(true);
                setError("");

                await refresh();
            } catch (error) {
                console.error(
                    "Failed to refresh notifications:",
                    error
                );

                setError(
                    "Nu am putut reîmprospăta notificările."
                );
            } finally {
                setRefreshing(false);
            }
        }, [refresh]);

    /**
     * Mark all notifications as read.
     */
    const handleMarkAllAsRead =
        useCallback(async () => {
            if (
                actionLoading ||
                unreadCount === 0
            ) {
                return;
            }

            try {
                setActionLoading(true);

                await markAllAsRead();
            } catch (error) {
                console.error(
                    "Failed to mark all notifications as read:",
                    error
                );

                Alert.alert(
                    "Eroare",
                    "Notificările nu au putut fi marcate ca citite."
                );
            } finally {
                setActionLoading(false);
            }
        }, [
            actionLoading,
            unreadCount,
            markAllAsRead,
        ]);

    /**
     * Delete notification.
     */
    const handleDelete =
        useCallback(
            async (
                notificationId: string
            ) => {
                try {
                    await remove(
                        notificationId
                    );
                } catch (error) {
                    console.error(
                        "Failed to delete notification:",
                        error
                    );

                    Alert.alert(
                        "Eroare",
                        "Notificarea nu a putut fi ștearsă."
                    );
                }
            },
            [remove]
        );

    /**
     * Open notification target.
     */
    const handleNotificationPress =
        useCallback(
            async (
                notification: NotificationItem
            ) => {
                if (
                    !notification.read
                ) {
                    try {
                        await markAsRead(
                            notification._id
                        );
                    } catch (error) {
                        console.error(
                            "Failed to mark notification as read:",
                            error
                        );
                    }
                }

                /**
                 * Conversation notification.
                 */
                if (
                    notification.conversation
                ) {
                    router.push({
                        pathname:
                            "/chat/[id]",
                        params: {
                            id: String(
                                notification.conversation
                            ),
                        },
                    });

                    return;
                }

                /**
                 * Listing notification.
                 */
                if (
                    notification.listing?._id
                ) {
                    router.push({
                        pathname:
                            "/listing/[id]",
                        params: {
                            id: String(
                                notification
                                    .listing
                                    ._id
                            ),
                        },
                    });

                    return;
                }
            },
            [markAsRead]
        );

    return (
        <SafeAreaView
            style={
                styles.container
            }
        >
            <FlatList
                data={notifications}
                keyExtractor={(item) =>
                    item._id
                }
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    notifications.length ===
                        0
                        ? styles.emptyContent
                        : styles.content
                }
                refreshControl={
                    <RefreshControl
                        refreshing={
                            refreshing
                        }
                        onRefresh={
                            handleRefresh
                        }
                        tintColor={
                            theme
                                .colors
                                .primary
                        }
                    />
                }
                ListHeaderComponent={
                    <View
                        style={
                            styles.header
                        }
                    >
                        <View
                            style={
                                styles.headerLeft
                            }
                        >
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
                                        theme
                                            .colors
                                            .text
                                    }
                                />
                            </Pressable>

                            <View>
                                <Text
                                    style={
                                        styles.title
                                    }
                                >
                                    Notifications
                                </Text>

                                <Text
                                    style={
                                        styles.subtitle
                                    }
                                >
                                    {unreadCount >
                                    0
                                        ? `${unreadCount} unread`
                                        : "You're all caught up"}
                                </Text>
                            </View>
                        </View>

                        {unreadCount >
                        0 ? (
                            <Pressable
                                onPress={
                                    handleMarkAllAsRead
                                }
                                disabled={
                                    actionLoading
                                }
                            >
                                {actionLoading ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={
                                            theme
                                                .colors
                                                .primary
                                        }
                                    />
                                ) : (
                                    <Text
                                        style={
                                            styles.markAll
                                        }
                                    >
                                        Mark all
                                    </Text>
                                )}
                            </Pressable>
                        ) : null}
                    </View>
                }
                renderItem={({
                    item,
                }) => (
                    <NotificationRow
                        item={item}
                        theme={theme}
                        onPress={() =>
                            handleNotificationPress(
                                item
                            )
                        }
                        onDelete={() =>
                            handleDelete(
                                item._id
                            )
                        }
                    />
                )}
                ListEmptyComponent={
                    loading ? (
                        <View
                            style={
                                styles.loading
                            }
                        >
                            <ActivityIndicator
                                size="large"
                                color={
                                    theme
                                        .colors
                                        .primary
                                }
                            />

                            <Text
                                style={
                                    styles.loadingText
                                }
                            >
                                Se încarcă
                                notificările...
                            </Text>
                        </View>
                    ) : error ? (
                        <View
                            style={
                                styles.empty
                            }
                        >
                            <View
                                style={
                                    styles.emptyIcon
                                }
                            >
                                <Ionicons
                                    name="cloud-offline-outline"
                                    size={32}
                                    color={
                                        theme
                                            .colors
                                            .textMuted
                                    }
                                />
                            </View>

                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                {error}
                            </Text>

                            <Pressable
                                onPress={() =>
                                    refresh()
                                }
                                style={
                                    styles.retryButton
                                }
                            >
                                <Text
                                    style={
                                        styles.retryText
                                    }
                                >
                                    Încearcă din nou
                                </Text>
                            </Pressable>
                        </View>
                    ) : (
                        <EmptyNotifications
                            theme={theme}
                        />
                    )
                }
            />
        </SafeAreaView>
    );
}

function NotificationRow({
    item,
    theme,
    onPress,
    onDelete,
}: {
    item: NotificationItem;
    theme: ReturnType<
        typeof useTheme
    >["theme"];
    onPress: () => void;
    onDelete: () => void;
}) {
    const icon =
        getNotificationIcon(
            item.type
        );

    return (
        <Pressable
            onPress={onPress}
            onLongPress={() =>
                Alert.alert(
                    "Notificare",
                    "Ce dorești să faci?",
                    [
                        {
                            text: "Anulează",
                            style: "cancel",
                        },
                        {
                            text: "Șterge",
                            style: "destructive",
                            onPress:
                                onDelete,
                        },
                    ]
                )
            }
            style={({ pressed }) => [
                {
                    flexDirection:
                        "row",
                    paddingVertical:
                        theme.spacing.lg,
                    paddingHorizontal:
                        theme.spacing.md,
                    marginBottom:
                        theme.spacing.sm,
                    borderRadius:
                        theme.radius.xl,
                    backgroundColor:
                        item.read
                            ? theme
                                  .colors
                                  .surface
                            : theme
                                  .colors
                                  .primarySoft,
                    borderWidth: 1,
                    borderColor:
                        item.read
                            ? theme
                                  .colors
                                  .border
                            : theme
                                  .colors
                                  .primary,
                },

                pressed && {
                    opacity: 0.75,
                },
            ]}
        >
            <View
                style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    alignItems:
                        "center",
                    justifyContent:
                        "center",
                    backgroundColor:
                        item.read
                            ? theme
                                  .colors
                                  .surfaceSecondary
                            : theme
                                  .colors
                                  .surface,
                }}
            >
                <Ionicons
                    name={icon}
                    size={21}
                    color={
                        item.read
                            ? theme
                                  .colors
                                  .textSecondary
                            : theme
                                  .colors
                                  .primary
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
                <View
                    style={{
                        flexDirection:
                            "row",
                        alignItems:
                            "center",
                    }}
                >
                    <Text
                        numberOfLines={1}
                        style={{
                            flex: 1,
                            color:
                                theme
                                    .colors
                                    .text,
                            fontSize: 14,
                            fontWeight:
                                item.read
                                    ? "600"
                                    : "800",
                        }}
                    >
                        {item.title}
                    </Text>

                    {!item.read ? (
                        <View
                            style={{
                                width: 8,
                                height: 8,
                                marginLeft:
                                    theme
                                        .spacing
                                        .sm,
                                borderRadius:
                                    4,
                                backgroundColor:
                                    theme
                                        .colors
                                        .primary,
                            }}
                        />
                    ) : null}
                </View>

                <Text
                    style={{
                        marginTop:
                            theme.spacing
                                .xs,
                        color:
                            theme.colors
                                .textSecondary,
                        fontSize: 12,
                        lineHeight: 18,
                    }}
                >
                    {item.message}
                </Text>

                {item.actor ? (
                    <Text
                        style={{
                            marginTop:
                                theme.spacing
                                    .xs,
                            color:
                                theme.colors
                                    .textMuted,
                            fontSize: 11,
                        }}
                    >
                        {item.actor.username}
                    </Text>
                ) : null}

                <Text
                    style={{
                        marginTop:
                            theme.spacing
                                .sm,
                        color:
                            theme.colors
                                .textMuted,
                        fontSize: 10,
                    }}
                >
                    {formatDate(
                        item.createdAt
                    )}
                </Text>
            </View>

            <Ionicons
                name="chevron-forward"
                size={17}
                color={
                    theme.colors
                        .textMuted
                }
                style={{
                    alignSelf:
                        "center",
                    marginLeft:
                        theme.spacing.sm,
                }}
            />
        </Pressable>
    );
}

function getNotificationIcon(
    type: string
): keyof typeof Ionicons.glyphMap {
    switch (type) {
        case "message":
        case "new_message":
            return "chatbubble-outline";

        case "favorite":
        case "listing_favorited":
            return "heart-outline";

        case "sale":
        case "order":
        case "sold":
            return "bag-check-outline";

        case "offer":
            return "pricetag-outline";

        case "follow":
            return "person-add-outline";

        default:
            return "notifications-outline";
    }
}

function formatDate(
    value: string
) {
    if (!value) {
        return "";
    }

    const date =
        new Date(value);

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return value;
    }

    return date.toLocaleDateString(
        "ro-RO",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }
    );
}

function EmptyNotifications({
    theme,
}: {
    theme: ReturnType<
        typeof useTheme
    >["theme"];
}) {
    return (
        <View
            style={{
                alignItems:
                    "center",
                justifyContent:
                    "center",
                paddingTop: 100,
                paddingHorizontal:
                    theme.spacing.xl,
            }}
        >
            <View
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
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
                    name="notifications-off-outline"
                    size={32}
                    color={
                        theme.colors
                            .textMuted
                    }
                />
            </View>

            <Text
                style={{
                    marginTop:
                        theme.spacing.lg,
                    color:
                        theme.colors
                            .text,
                    fontSize: 18,
                    fontWeight:
                        "800",
                }}
            >
                No notifications
            </Text>

            <Text
                style={{
                    marginTop:
                        theme.spacing.sm,
                    textAlign:
                        "center",
                    color:
                        theme.colors
                            .textSecondary,
                    fontSize: 13,
                    lineHeight: 20,
                }}
            >
                Când vei primi notificări,
                acestea vor apărea aici.
            </Text>
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
            paddingHorizontal:
                theme.spacing.lg,
            paddingTop:
                theme.spacing.xl,
            paddingBottom:
                theme.spacing["5xl"],
        },

        emptyContent: {
            flexGrow: 1,
            paddingHorizontal:
                theme.spacing.lg,
            paddingTop:
                theme.spacing.xl,
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

        headerLeft: {
            flexDirection:
                "row",
            alignItems:
                "center",
            flex: 1,
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
            marginRight:
                theme.spacing.md,
            backgroundColor:
                theme.colors.surface,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        title: {
            color:
                theme.colors.text,
            fontSize: 25,
            fontWeight:
                "900",
            letterSpacing:
                -0.5,
        },

        subtitle: {
            marginTop:
                theme.spacing.xs,
            color:
                theme.colors
                    .textSecondary,
            fontSize: 12,
        },

        markAll: {
            color:
                theme.colors.primary,
            fontSize: 12,
            fontWeight:
                "800",
        },

        loading: {
            alignItems:
                "center",
            paddingTop: 100,
        },

        loadingText: {
            marginTop:
                theme.spacing.md,
            color:
                theme.colors
                    .textSecondary,
            fontSize: 13,
        },

        empty: {
            alignItems:
                "center",
            paddingTop: 100,
            paddingHorizontal:
                theme.spacing.xl,
        },

        emptyIcon: {
            width: 72,
            height: 72,
            borderRadius: 36,
            alignItems:
                "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors
                    .surfaceSecondary,
        },

        emptyTitle: {
            marginTop:
                theme.spacing.lg,
            textAlign: "center",
            color:
                theme.colors.text,
            fontSize: 16,
            fontWeight:
                "800",
        },

        retryButton: {
            marginTop:
                theme.spacing.lg,
            paddingHorizontal:
                theme.spacing.lg,
            paddingVertical:
                theme.spacing.sm,
            borderRadius:
                theme.radius.full,
            backgroundColor:
                theme.colors.primary,
        },

        retryText: {
            color:
                theme.colors
                    .primaryText,
            fontSize: 13,
            fontWeight:
                "800",
        },
    });
}