import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Image } from "expo-image";

import { SafeScreen } from "@/components/SafeScreen";
import {
    ChatUser,
    Conversation,
    chatService,
} from "@/services/chatService";
import { useTheme } from "@/theme";
import { useAuth } from "@/hooks/useAuth";

export default function MessagesScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();

    const styles = useMemo(
        () => createStyles(theme),
        [theme]
    );

    const [
        conversations,
        setConversations,
    ] = useState<Conversation[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const loadConversations =
        useCallback(
            async (
                showLoader = true
            ) => {
                try {
                    if (showLoader) {
                        setLoading(true);
                    }

                    setError("");

                    const data =
                        await chatService.getConversations();

                    setConversations(
                        data
                    );
                } catch (error) {
                    console.error(
                        "Failed to load conversations:",
                        error
                    );

                    setError(
                        "Nu am putut încărca mesajele."
                    );
                } finally {
                    setLoading(false);
                    setRefreshing(false);
                }
            },
            []
        );

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    useEffect(() => {
        const interval = setInterval(() => {
            loadConversations(false);
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [loadConversations]);

    const handleRefresh =
        useCallback(() => {
            setRefreshing(true);

            loadConversations(false);
        }, [loadConversations]);

    function openConversation(
        conversationId: string
    ) {
        router.push({
            pathname: "/chat/[id]",
            params: {
                id: conversationId,
            },
        });
    }

    function getOtherParticipant(
        conversation: Conversation
    ): ChatUser | null {
        return (
            conversation
                .participants?.[0] ??
            null
        );
    }

    function getLastMessage(
        conversation: Conversation
    ) {
        if (
            typeof conversation.lastMessage ===
            "string"
        ) {
            return conversation.lastMessage;
        }

        if (
            conversation.lastMessage &&
            typeof conversation.lastMessage ===
            "object"
        ) {
            return (
                conversation.lastMessage
                    .text || ""
            );
        }

        return "";
    }

    function getUnreadCount(
        conversation: Conversation
    ) {
        if (
            !conversation.unread ||
            !user?._id
        ) {
            return 0;
        }

        return Number(
            conversation.unread[user._id] || 0
        );
    }

    function formatDate(
        value?: string
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
            return "";
        }

        const now =
            new Date();

        const sameDay =
            date.toDateString() ===
            now.toDateString();

        if (sameDay) {
            return new Intl.DateTimeFormat(
                "ro-RO",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                }
            ).format(date);
        }

        const yesterday =
            new Date(now);

        yesterday.setDate(
            now.getDate() - 1
        );

        if (
            date.toDateString() ===
            yesterday.toDateString()
        ) {
            return "Ieri";
        }

        return new Intl.DateTimeFormat(
            "ro-RO",
            {
                day: "2-digit",
                month: "2-digit",
            }
        ).format(date);
    }

    function renderConversation({
        item,
    }: {
        item: Conversation;
    }) {
        const participant =
            getOtherParticipant(
                item
            );

        const lastMessage =
            getLastMessage(item);

        const unread =
            getUnreadCount(item);

        return (
            <Pressable
                onPress={() =>
                    openConversation(
                        item._id
                    )
                }
                style={({ pressed }) => [
                    styles.conversation,
                    pressed &&
                    styles.conversationPressed,
                ]}
            >
                <View
                    style={
                        styles.avatarContainer
                    }
                >
                    {participant?.avatar ? (
                        <Image
                            source={{
                                uri: participant.avatar,
                            }}
                            style={
                                styles.avatar
                            }
                            contentFit="cover"
                        />
                    ) : (
                        <View
                            style={
                                styles.avatarPlaceholder
                            }
                        >
                            <Ionicons
                                name="person"
                                size={22}
                                color={
                                    theme.colors
                                        .textMuted
                                }
                            />
                        </View>
                    )}

                    {unread > 0 && (
                        <View
                            style={
                                styles.onlineDot
                            }
                        />
                    )}
                </View>

                <View
                    style={
                        styles.conversationContent
                    }
                >
                    <View
                        style={
                            styles.topRow
                        }
                    >
                        <Text
                            numberOfLines={
                                1
                            }
                            style={
                                styles.username
                            }
                        >
                            {participant?.username ||
                                "Utilizator"}
                        </Text>

                        <Text
                            style={
                                styles.date
                            }
                        >
                            {formatDate(
                                item.lastMessageAt
                            )}
                        </Text>
                    </View>

                    {item.listing && (
                        <Text
                            numberOfLines={
                                1
                            }
                            style={
                                styles.listingTitle
                            }
                        >
                            {item.listing.title}
                        </Text>
                    )}

                    <View
                        style={
                            styles.bottomRow
                        }
                    >
                        <Text
                            numberOfLines={
                                1
                            }
                            style={[
                                styles.lastMessage,
                                unread > 0 &&
                                styles.lastMessageUnread,
                            ]}
                        >
                            {lastMessage ||
                                "Începe conversația..."}
                        </Text>

                        {unread > 0 && (
                            <View
                                style={
                                    styles.unreadBadge
                                }
                            >
                                <Text
                                    style={
                                        styles.unreadText
                                    }
                                >
                                    {unread >
                                        99
                                        ? "99+"
                                        : unread}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {item.listing
                    ?.images?.[0] && (
                        <Image
                            source={{
                                uri: item.listing
                                    .images[0],
                            }}
                            style={
                                styles.listingImage
                            }
                            contentFit="cover"
                        />
                    )}
            </Pressable>
        );
    }

    if (loading) {
        return (
            <SafeScreen>
                <View
                    style={
                        styles.center
                    }
                >
                    <ActivityIndicator
                        size="large"
                        color={
                            theme.colors
                                .primary
                        }
                    />

                    <Text
                        style={
                            styles.loadingText
                        }
                    >
                        Se încarcă mesajele...
                    </Text>
                </View>
            </SafeScreen>
        );
    }

    return (
        <SafeScreen
            edges={[
                "top",
                "left",
                "right",
            ]}
        >
            <View
                style={
                    styles.container
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
                            Mesaje
                        </Text>

                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Conversațiile tale
                        </Text>
                    </View>

                    <Pressable
                        onPress={
                            handleRefresh
                        }
                        style={
                            styles.headerButton
                        }
                    >
                        <Ionicons
                            name="refresh-outline"
                            size={21}
                            color={
                                theme.colors
                                    .text
                            }
                        />
                    </Pressable>
                </View>

                {/* ERROR */}

                {error ? (
                    <View
                        style={
                            styles.errorContainer
                        }
                    >
                        <Ionicons
                            name="alert-circle-outline"
                            size={24}
                            color={
                                theme.colors
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

                        <Pressable
                            onPress={() =>
                                loadConversations()
                            }
                        >
                            <Text
                                style={
                                    styles.retryText
                                }
                            >
                                Reîncearcă
                            </Text>
                        </Pressable>
                    </View>
                ) : null}

                {/* CONVERSATIONS */}

                <FlatList
                    data={
                        conversations
                    }
                    keyExtractor={(
                        item
                    ) => item._id}
                    renderItem={
                        renderConversation
                    }
                    showsVerticalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        conversations.length ===
                            0
                            ? styles.emptyList
                            : styles.list
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
                                theme.colors
                                    .primary
                            }
                        />
                    }
                    ListEmptyComponent={
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
                                    name="chatbubbles-outline"
                                    size={34}
                                    color={
                                        theme.colors
                                            .primary
                                    }
                                />
                            </View>

                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                Nicio conversație
                            </Text>

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Când contactezi un
                                vânzător, conversația
                                va apărea aici.
                            </Text>

                            <Pressable
                                onPress={() =>
                                    router.push(
                                        "/(tabs)/explore"
                                    )
                                }
                                style={
                                    styles.exploreButton
                                }
                            >
                                <Text
                                    style={
                                        styles.exploreButtonText
                                    }
                                >
                                    Descoperă anunțuri
                                </Text>
                            </Pressable>
                        </View>
                    }
                />
            </View>
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
                theme.colors.background,
        },

        center: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal:
                theme.spacing.xl,
        },

        loadingText: {
            marginTop:
                theme.spacing.md,
            color:
                theme.colors.textSecondary,
            fontSize: 14,
        },

        header: {
            minHeight: 76,
            paddingHorizontal:
                theme.spacing.md,
            flexDirection: "row",
            alignItems: "center",
            justifyContent:
                "space-between",
            borderBottomWidth: 1,
            borderBottomColor:
                theme.colors.border,
            backgroundColor:
                theme.colors.surface,
        },

        title: {
            color:
                theme.colors.text,
            fontSize: 25,
            fontWeight: "800",
        },

        subtitle: {
            marginTop: 2,
            color:
                theme.colors.textMuted,
            fontSize: 12,
        },

        headerButton: {
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
                theme.colors.surfaceSecondary,
        },

        list: {
            paddingVertical:
                theme.spacing.xs,
        },

        conversation: {
            minHeight: 84,
            paddingHorizontal:
                theme.spacing.md,
            paddingVertical:
                theme.spacing.sm,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor:
                theme.colors.background,
        },

        conversationPressed: {
            opacity: 0.65,
        },

        avatarContainer: {
            width: 56,
            height: 56,
            borderRadius: 28,
            position: "relative",
        },

        avatar: {
            width: 56,
            height: 56,
            borderRadius: 28,
        },

        avatarPlaceholder: {
            width: 56,
            height: 56,
            borderRadius: 28,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
                theme.colors.surfaceSecondary,
        },

        onlineDot: {
            position: "absolute",
            right: 0,
            bottom: 1,
            width: 15,
            height: 15,
            borderRadius: 8,
            borderWidth: 2,
            borderColor:
                theme.colors.background,
            backgroundColor:
                theme.colors.primary,
        },

        conversationContent: {
            flex: 1,
            minWidth: 0,
            marginLeft:
                theme.spacing.sm,
        },

        topRow: {
            flexDirection: "row",
            alignItems: "center",
        },

        username: {
            flex: 1,
            color:
                theme.colors.text,
            fontSize: 15,
            fontWeight: "700",
        },

        date: {
            marginLeft:
                theme.spacing.xs,
            color:
                theme.colors.textMuted,
            fontSize: 10,
        },

        listingTitle: {
            marginTop: 2,
            color:
                theme.colors.primary,
            fontSize: 11,
            fontWeight: "600",
        },

        bottomRow: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: 4,
        },

        lastMessage: {
            flex: 1,
            color:
                theme.colors.textSecondary,
            fontSize: 13,
        },

        lastMessageUnread: {
            color:
                theme.colors.text,
            fontWeight: "700",
        },

        unreadBadge: {
            minWidth: 21,
            height: 21,
            paddingHorizontal: 5,
            marginLeft: 7,
            borderRadius: 11,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
                theme.colors.primary,
        },

        unreadText: {
            color:
                theme.colors.primaryText,
            fontSize: 10,
            fontWeight: "800",
        },

        listingImage: {
            width: 52,
            height: 52,
            marginLeft: 8,
            borderRadius: 10,
        },

        errorContainer: {
            margin:
                theme.spacing.md,
            padding:
                theme.spacing.md,
            borderRadius: 14,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            backgroundColor:
                theme.colors.danger,
        },

        errorText: {
            flex: 1,
            color:
                theme.colors.danger,
            fontSize: 12,
        },

        retryText: {
            color:
                theme.colors.primary,
            fontSize: 12,
            fontWeight: "800",
        },

        emptyList: {
            flexGrow: 1,
        },

        empty: {
            flex: 1,
            minHeight: 500,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal:
                theme.spacing.xl,
        },

        emptyIcon: {
            width: 76,
            height: 76,
            borderRadius: 38,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
                theme.colors.primarySoft,
        },

        emptyTitle: {
            marginTop:
                theme.spacing.lg,
            color:
                theme.colors.text,
            fontSize: 19,
            fontWeight: "800",
        },

        emptyText: {
            marginTop:
                theme.spacing.sm,
            maxWidth: 300,
            color:
                theme.colors.textSecondary,
            textAlign: "center",
            fontSize: 13,
            lineHeight: 20,
        },

        exploreButton: {
            marginTop:
                theme.spacing.lg,
            paddingHorizontal:
                theme.spacing.lg,
            paddingVertical:
                theme.spacing.md,
            borderRadius: 13,
            backgroundColor:
                theme.colors.primary,
        },

        exploreButtonText: {
            color:
                theme.colors.primaryText,
            fontSize: 13,
            fontWeight: "800",
        },
    });
}