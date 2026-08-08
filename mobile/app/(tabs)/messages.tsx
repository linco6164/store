import { useMemo, useState } from "react";

import {
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import {
    Ionicons,
} from "@expo/vector-icons";

import {
    useTheme,
} from "@/theme";

type Conversation = {
    id: string;
    name: string;
    message: string;
    time: string;
    unread: number;
    online: boolean;
};

const conversations: Conversation[] = [
    {
        id: "1",
        name: "Andrei",
        message:
            "Mai este disponibil produsul?",
        time: "10:42",
        unread: 2,
        online: true,
    },
    {
        id: "2",
        name: "Maria",
        message:
            "Perfect, îl iau. Mulțumesc!",
        time: "09:18",
        unread: 0,
        online: false,
    },
    {
        id: "3",
        name: "Alex",
        message:
            "Putem negocia puțin prețul?",
        time: "Ieri",
        unread: 1,
        online: true,
    },
    {
        id: "4",
        name: "Ioana",
        message:
            "Când poți face livrarea?",
        time: "Ieri",
        unread: 0,
        online: false,
    },
];

export default function MessagesScreen() {
    const { theme } =
        useTheme();

    const [search, setSearch] =
        useState("");

    const styles =
        createStyles(theme);

    const filteredConversations =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return conversations;
            }

            return conversations.filter(
                (conversation) =>
                    conversation.name
                        .toLowerCase()
                        .includes(query) ||
                    conversation.message
                        .toLowerCase()
                        .includes(query)
            );
        }, [search]);

    return (
        <View
            style={
                styles.container
            }
        >
            <FlatList
                data={
                    filteredConversations
                }
                keyExtractor={(item) =>
                    item.id
                }
                showsVerticalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.content
                }
                ListHeaderComponent={
                    <>
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
                                    Messages
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
                                style={
                                    styles.composeButton
                                }
                                onPress={() => {}}
                            >
                                <Ionicons
                                    name="create-outline"
                                    size={21}
                                    color={
                                        theme
                                            .colors
                                            .primaryText
                                    }
                                />
                            </Pressable>
                        </View>

                        {/* SEARCH */}

                        <View
                            style={
                                styles.searchWrapper
                            }
                        >
                            <Ionicons
                                name="search-outline"
                                size={20}
                                color={
                                    theme
                                        .colors
                                        .textMuted
                                }
                            />

                            <TextInput
                                value={search}
                                onChangeText={
                                    setSearch
                                }
                                placeholder="Search messages..."
                                placeholderTextColor={
                                    theme
                                        .colors
                                        .textMuted
                                }
                                style={
                                    styles.searchInput
                                }
                            />

                            {search.length >
                            0 ? (
                                <Pressable
                                    onPress={() =>
                                        setSearch(
                                            ""
                                        )
                                    }
                                    hitSlop={8}
                                >
                                    <Ionicons
                                        name="close-circle"
                                        size={19}
                                        color={
                                            theme
                                                .colors
                                                .textMuted
                                        }
                                    />
                                </Pressable>
                            ) : null}
                        </View>

                        {/* SECTION */}

                        <View
                            style={
                                styles.sectionHeader
                            }
                        >
                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Recent
                            </Text>

                            <Text
                                style={
                                    styles.count
                                }
                            >
                                {
                                    filteredConversations.length
                                }
                            </Text>
                        </View>
                    </>
                }
                renderItem={({
                    item,
                }) => (
                    <ConversationItem
                        conversation={
                            item
                        }
                        theme={theme}
                    />
                )}
                ListEmptyComponent={
                    <EmptyMessages
                        theme={theme}
                    />
                }
            />
        </View>
    );
}

function ConversationItem({
    conversation,
    theme,
}: {
    conversation: Conversation;
    theme: ReturnType<
        typeof useTheme
    >["theme"];
}) {
    return (
        <Pressable
            onPress={() => {
                // Conversation screen will be connected next.
            }}
            style={({ pressed }) => [
                {
                    flexDirection:
                        "row",
                    alignItems:
                        "center",
                    paddingVertical:
                        theme.spacing.md,
                    borderBottomWidth: 1,
                    borderBottomColor:
                        theme.colors
                            .border,
                },

                pressed && {
                    opacity: 0.7,
                },
            ]}
        >
            {/* AVATAR */}

            <View
                style={
                    stylesForAvatar(
                        theme
                    ).avatar
                }
            >
                <Text
                    style={
                        stylesForAvatar(
                            theme
                        ).avatarText
                    }
                >
                    {conversation.name
                        .charAt(0)
                        .toUpperCase()}
                </Text>

                {conversation.online ? (
                    <View
                        style={
                            stylesForAvatar(
                                theme
                            ).online
                        }
                    />
                ) : null}
            </View>

            {/* CONTENT */}

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
                        justifyContent:
                            "space-between",
                    }}
                >
                    <Text
                        style={{
                            color:
                                theme
                                    .colors
                                    .text,
                            fontSize: 15,
                            fontWeight:
                                "800",
                        }}
                    >
                        {
                            conversation.name
                        }
                    </Text>

                    <Text
                        style={{
                            color:
                                conversation
                                    .unread >
                                0
                                    ? theme
                                          .colors
                                          .primary
                                    : theme
                                          .colors
                                          .textMuted,
                            fontSize: 11,
                            fontWeight:
                                conversation
                                    .unread >
                                0
                                    ? "700"
                                    : "500",
                        }}
                    >
                        {
                            conversation.time
                        }
                    </Text>
                </View>

                <View
                    style={{
                        flexDirection:
                            "row",
                        alignItems:
                            "center",
                        marginTop:
                            theme.spacing
                                .xs,
                    }}
                >
                    <Text
                        numberOfLines={1}
                        style={{
                            flex: 1,
                            color:
                                conversation
                                    .unread >
                                0
                                    ? theme
                                          .colors
                                          .text
                                    : theme
                                          .colors
                                          .textSecondary,
                            fontSize: 13,
                            fontWeight:
                                conversation
                                    .unread >
                                0
                                    ? "600"
                                    : "400",
                        }}
                    >
                        {
                            conversation.message
                        }
                    </Text>

                    {conversation.unread >
                    0 ? (
                        <View
                            style={{
                                minWidth: 21,
                                height: 21,
                                paddingHorizontal:
                                    5,
                                marginLeft:
                                    theme
                                        .spacing
                                        .sm,
                                borderRadius:
                                    11,
                                alignItems:
                                    "center",
                                justifyContent:
                                    "center",
                                backgroundColor:
                                    theme
                                        .colors
                                        .primary,
                            }}
                        >
                            <Text
                                style={{
                                    color:
                                        theme
                                            .colors
                                            .primaryText,
                                    fontSize: 10,
                                    fontWeight:
                                        "800",
                                }}
                            >
                                {
                                    conversation.unread
                                }
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>

            <Ionicons
                name="chevron-forward"
                size={17}
                color={
                    theme.colors
                        .textMuted
                }
                style={{
                    marginLeft:
                        theme.spacing
                            .sm,
                }}
            />
        </Pressable>
    );
}

function EmptyMessages({
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
                paddingTop: 80,
                paddingHorizontal:
                    theme.spacing.xl,
            }}
        >
            <View
                style={{
                    width: 68,
                    height: 68,
                    borderRadius: 34,
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
                    name="chatbubbles-outline"
                    size={31}
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
                No messages yet
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
                Când vei începe o
                conversație cu un
                cumpărător sau vânzător,
                aceasta va apărea aici.
            </Text>
        </View>
    );
}

function stylesForAvatar(
    theme: ReturnType<
        typeof useTheme
    >["theme"]
) {
    return StyleSheet.create({
        avatar: {
            width: 52,
            height: 52,
            borderRadius: 26,
            alignItems:
                "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors
                    .primarySoft,
            position:
                "relative",
        },

        avatarText: {
            color:
                theme.colors
                    .primaryDark,
            fontSize: 17,
            fontWeight:
                "800",
        },

        online: {
            position:
                "absolute",
            right: 1,
            bottom: 1,
            width: 13,
            height: 13,
            borderRadius: 7,
            backgroundColor:
                theme.colors
                    .success,
            borderWidth: 2,
            borderColor:
                theme.colors.surface,
        },
    });
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
            paddingTop:
                theme.spacing.xl,
            paddingBottom:
                theme.spacing.lg,
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

        composeButton: {
            width: 44,
            height: 44,
            borderRadius:
                theme.radius.full,
            alignItems:
                "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors
                    .primary,
        },

        searchWrapper: {
            height: 50,
            flexDirection:
                "row",
            alignItems:
                "center",
            gap:
                theme.spacing.sm,
            paddingHorizontal:
                theme.spacing.md,
            borderRadius:
                theme.radius.full,
            backgroundColor:
                theme.colors
                    .surface,
            borderWidth: 1,
            borderColor:
                theme.colors
                    .border,
        },

        searchInput: {
            flex: 1,
            height: "100%",
            color:
                theme.colors.text,
            fontSize: 14,
        },

        sectionHeader: {
            flexDirection:
                "row",
            alignItems:
                "center",
            gap:
                theme.spacing.sm,
            marginTop:
                theme.spacing["2xl"],
            marginBottom:
                theme.spacing.xs,
        },

        sectionTitle: {
            color:
                theme.colors.text,
            fontSize: 17,
            fontWeight:
                "800",
        },

        count: {
            minWidth: 23,
            height: 23,
            paddingHorizontal: 6,
            borderRadius: 12,
            alignItems:
                "center",
            justifyContent:
                "center",
            textAlign:
                "center",
            backgroundColor:
                theme.colors
                    .primarySoft,
            color:
                theme.colors
                    .primaryDark,
            fontSize: 11,
            fontWeight:
                "800",
            overflow: "hidden",
        },
    });
}