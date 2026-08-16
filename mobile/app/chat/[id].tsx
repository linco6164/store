import { Ionicons } from "@expo/vector-icons";
import {
    router,
    useLocalSearchParams,
} from "expo-router";
import {
    useCallback,
    useEffect,
    useMemo,
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

import { Image } from "expo-image";

import { SafeScreen } from "@/components/SafeScreen";

import {
    chatService,
    Conversation,
    Message,
} from "@/services/chatService";

import { useTheme } from "@/theme";
import { useAuth } from "@/hooks/useAuth";

export default function ChatScreen() {
    const { theme } = useTheme();
    const { user } = useAuth();

    const styles = useMemo(
        () => createStyles(theme),
        [theme]
    );

    const { id } =
        useLocalSearchParams<{
            id: string;
        }>();

    const [conversation, setConversation] =
        useState<Conversation | null>(null);

    const [messages, setMessages] =
        useState<Message[]>([]);

    const [text, setText] =
        useState("");

    const [loading, setLoading] =
        useState(true);

    const [sending, setSending] =
        useState(false);

    const [error, setError] =
        useState("");

    const loadChat = useCallback(
        async () => {
            if (!id) {
                setError(
                    "Conversație invalidă."
                );
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const [
                    conversationData,
                    messagesData,
                ] = await Promise.all([
                    chatService.getConversation(
                        id
                    ),
                    chatService.getMessages(
                        id
                    ),
                ]);

                setConversation(
                    conversationData
                );

                setMessages(messagesData);

                if (
                    messagesData.length > 0
                ) {
                    const lastMessage =
                        messagesData[
                        messagesData.length - 1
                        ];

                    try {
                        await chatService.markAsSeen(
                            id,
                            lastMessage._id
                        );
                    } catch (seenError) {
                        console.error(
                            "Failed to mark messages as seen:",
                            seenError
                        );
                    }
                }
            } catch (chatError) {
                console.error(
                    "Failed to load chat:",
                    chatError
                );

                setError(
                    "Nu am putut încărca conversația."
                );
            } finally {
                setLoading(false);
            }
        },
        [id]
    );

    useEffect(() => {
        loadChat();
    }, [loadChat]);

    useEffect(() => {
        if (!id) {
            return;
        }

        const interval = setInterval(async () => {
            try {
                const messagesData =
                    await chatService.getMessages(id);

                setMessages((current) => {
                    if (
                        messagesData.length ===
                        current.length
                    ) {
                        return current;
                    }

                    return messagesData;
                });

                if (messagesData.length > 0) {
                    const lastMessage =
                        messagesData[
                        messagesData.length - 1
                        ];

                    await chatService.markAsSeen(
                        id,
                        lastMessage._id
                    );
                }
            } catch (error) {
                console.error(
                    "Failed to refresh messages:",
                    error
                );
            }
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [id]);

    async function handleSend() {
        const value =
            text.trim();

        if (
            !value ||
            !id ||
            sending
        ) {
            return;
        }

        try {
            setSending(true);

            const message =
                await chatService.sendMessage(
                    id,
                    value
                );

            setMessages(
                (current) => [
                    ...current,
                    message,
                ]
            );

            setText("");
        } catch (sendError) {
            console.error(
                "Failed to send message:",
                sendError
            );
        } finally {
            setSending(false);
        }
    }

    function getOtherParticipant() {
        if (
            !conversation?.participants
                ?.length
        ) {
            return null;
        }

        return (
            conversation
                .participants[0] ?? null
        );
    }

    const participant =
        getOtherParticipant();

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
                        Se încarcă conversația...
                    </Text>
                </View>
            </SafeScreen>
        );
    }

    if (
        error ||
        !conversation
    ) {
        return (
            <SafeScreen>
                <View
                    style={
                        styles.center
                    }
                >
                    <Ionicons
                        name="chatbubble-ellipses-outline"
                        size={42}
                        color={
                            theme.colors
                                .textMuted
                        }
                    />

                    <Text
                        style={
                            styles.errorTitle
                        }
                    >
                        {error ||
                            "Conversația nu a fost găsită."}
                    </Text>

                    <Pressable
                        onPress={() =>
                            router.back()
                        }
                        style={
                            styles.backButton
                        }
                    >
                        <Text
                            style={
                                styles.backButtonText
                            }
                        >
                            Înapoi
                        </Text>
                    </Pressable>
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
                {/* HEADER */}

                <View
                    style={
                        styles.header
                    }
                >
                    <Pressable
                        onPress={() =>
                            router.back()
                        }
                        style={
                            styles.headerButton
                        }
                    >
                        <Ionicons
                            name="arrow-back"
                            size={23}
                            color={
                                theme.colors
                                    .text
                            }
                        />
                    </Pressable>

                    <View
                        style={
                            styles.headerAvatar
                        }
                    >
                        {participant?.avatar ? (
                            <Image
                                source={{
                                    uri: participant.avatar,
                                }}
                                style={
                                    styles.avatarImage
                                }
                                contentFit="cover"
                            />
                        ) : (
                            <Ionicons
                                name="person"
                                size={20}
                                color={
                                    theme.colors
                                        .textMuted
                                }
                            />
                        )}
                    </View>

                    <View
                        style={
                            styles.headerInfo
                        }
                    >
                        <Text
                            numberOfLines={1}
                            style={
                                styles.headerName
                            }
                        >
                            {participant?.username ||
                                "Utilizator"}
                        </Text>

                        {conversation.listing ? (
                            <Text
                                numberOfLines={
                                    1
                                }
                                style={
                                    styles.headerListing
                                }
                            >
                                {
                                    conversation
                                        .listing
                                        .title
                                }
                            </Text>
                        ) : (
                            <Text
                                style={
                                    styles.headerListing
                                }
                            >
                                Conversație
                            </Text>
                        )}
                    </View>

                    <Pressable
                        style={
                            styles.headerButton
                        }
                    >
                        <Ionicons
                            name="ellipsis-horizontal"
                            size={22}
                            color={
                                theme.colors
                                    .text
                            }
                        />
                    </Pressable>
                </View>

                {/* LISTING PREVIEW */}

                {conversation.listing ? (
                    <View
                        style={
                            styles.listingPreview
                        }
                    >
                        {conversation.listing
                            .images?.[0] ? (
                            <Image
                                source={{
                                    uri:
                                        conversation
                                            .listing
                                            .images[0],
                                }}
                                style={
                                    styles.listingImage
                                }
                                contentFit="cover"
                            />
                        ) : (
                            <View
                                style={
                                    styles.listingImagePlaceholder
                                }
                            >
                                <Ionicons
                                    name="image-outline"
                                    size={22}
                                    color={
                                        theme.colors
                                            .textMuted
                                    }
                                />
                            </View>
                        )}

                        <View
                            style={
                                styles.listingInfo
                            }
                        >
                            <Text
                                numberOfLines={
                                    1
                                }
                                style={
                                    styles.listingTitle
                                }
                            >
                                {
                                    conversation
                                        .listing
                                        .title
                                }
                            </Text>

                            <Text
                                style={
                                    styles.listingPrice
                                }
                            >
                                {
                                    conversation
                                        .listing
                                        .price
                                }{" "}
                                Lei
                            </Text>
                        </View>
                    </View>
                ) : null}

                {/* MESSAGES */}

                <ScrollView
                    style={
                        styles.messagesContainer
                    }
                    contentContainerStyle={
                        styles.messagesContent
                    }
                    showsVerticalScrollIndicator={
                        false
                    }
                    keyboardShouldPersistTaps="handled"
                >
                    {messages.length ===
                        0 ? (
                        <View
                            style={
                                styles.emptyChat
                            }
                        >
                            <View
                                style={
                                    styles.emptyIcon
                                }
                            >
                                <Ionicons
                                    name="chatbubble-outline"
                                    size={28}
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
                                Începe conversația
                            </Text>

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Trimite un mesaj
                                pentru a începe
                                discuția.
                            </Text>
                        </View>
                    ) : (
                        messages.map(
                            (
                                message
                            ) => (
                                <MessageBubble
                                    key={
                                        message._id
                                    }
                                    message={
                                        message
                                    }
                                    theme={
                                        theme
                                    }
                                    currentUserId={user?._id}
                                />
                            )
                        )
                    )}
                </ScrollView>

                {/* COMPOSER */}

                <View
                    style={
                        styles.composer
                    }
                >
                    <Pressable
                        style={
                            styles.attachButton
                        }
                    >
                        <Ionicons
                            name="add"
                            size={23}
                            color={
                                theme.colors
                                    .textSecondary
                            }
                        />
                    </Pressable>

                    <TextInput
                        value={text}
                        onChangeText={
                            setText
                        }
                        placeholder="Scrie un mesaj..."
                        placeholderTextColor={
                            theme.colors
                                .textMuted
                        }
                        multiline
                        maxLength={2000}
                        style={
                            styles.input
                        }
                    />

                    <Pressable
                        onPress={
                            handleSend
                        }
                        disabled={
                            !text.trim() ||
                            sending
                        }
                        style={[
                            styles.sendButton,
                            {
                                backgroundColor:
                                    text.trim() &&
                                        !sending
                                        ? theme
                                            .colors
                                            .primary
                                        : theme
                                            .colors
                                            .surfaceSecondary,
                            },
                        ]}
                    >
                        {sending ? (
                            <ActivityIndicator
                                size="small"
                                color={
                                    theme.colors
                                        .primaryText
                                }
                            />
                        ) : (
                            <Ionicons
                                name="arrow-up"
                                size={21}
                                color={
                                    text.trim()
                                        ? theme
                                            .colors
                                            .primaryText
                                        : theme
                                            .colors
                                            .textMuted
                                }
                            />
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeScreen>
    );
}

function MessageBubble({
    message,
    theme,
    currentUserId,
}: {
    message: Message;
    theme: ReturnType<
        typeof useTheme
    >["theme"];
    currentUserId?: string;
}) {
    const styles =
        createStyles(theme);

    /**
     * Momentan determinăm mesajele
     * locale folosind informația
     * disponibilă în mesaj.
     *
     * Backend-ul returnează sender._id.
     *
     * Pentru identificarea exactă
     * a utilizatorului curent vom lega
     * ulterior AuthContext-ul.
     */
    const isOwnMessage =
        Boolean(
            currentUserId &&
            message.sender?._id ===
            currentUserId
        );

    return (
        <View
            style={[
                styles.messageRow,
                isOwnMessage
                    ? styles.messageRowOwn
                    : styles.messageRowOther,
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isOwnMessage
                        ? styles.bubbleOwn
                        : styles.bubbleOther,
                ]}
            >
                {message.images?.map(
                    (
                        image,
                        index
                    ) => (
                        <Image
                            key={`${message._id}-${index}`}
                            source={{
                                uri: image,
                            }}
                            style={
                                styles.messageImage
                            }
                            contentFit="cover"
                        />
                    )
                )}

                {message.text ? (
                    <Text
                        style={[
                            styles.messageText,
                            isOwnMessage
                                ? styles.messageTextOwn
                                : styles.messageTextOther,
                        ]}
                    >
                        {message.text}
                    </Text>
                ) : null}

                <Text
                    style={[
                        styles.messageTime,
                        isOwnMessage
                            ? styles.messageTimeOwn
                            : styles.messageTimeOther,
                    ]}
                >
                    {formatMessageTime(
                        message.createdAt
                    )}
                </Text>
            </View>
        </View>
    );
}

function formatMessageTime(
    date: string
) {
    try {
        return new Intl.DateTimeFormat(
            "ro-RO",
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        ).format(new Date(date));
    } catch {
        return "";
    }
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

        errorTitle: {
            marginTop:
                theme.spacing.md,
            textAlign: "center",
            color:
                theme.colors.text,
            fontSize: 16,
            fontWeight: "700",
        },

        backButton: {
            marginTop:
                theme.spacing.lg,
            paddingHorizontal:
                theme.spacing.xl,
            paddingVertical:
                theme.spacing.md,
            borderRadius: 12,
            backgroundColor:
                theme.colors.primary,
        },

        backButtonText: {
            color:
                theme.colors.primaryText,
            fontSize: 14,
            fontWeight: "700",
        },

        header: {
            minHeight: 64,
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
            width: 42,
            height: 42,
            alignItems: "center",
            justifyContent: "center",
        },

        headerAvatar: {
            width: 40,
            height: 40,
            marginLeft: 2,
            borderRadius: 20,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
                theme.colors.surfaceSecondary,
        },

        avatarImage: {
            width: "100%",
            height: "100%",
        },

        headerInfo: {
            flex: 1,
            marginHorizontal:
                theme.spacing.sm,
        },

        headerName: {
            color:
                theme.colors.text,
            fontSize: 15,
            fontWeight: "800",
        },

        headerListing: {
            marginTop: 2,
            color:
                theme.colors.textMuted,
            fontSize: 11,
        },

        listingPreview: {
            flexDirection: "row",
            alignItems: "center",
            marginHorizontal:
                theme.spacing.md,
            marginTop:
                theme.spacing.sm,
            padding: 8,
            borderRadius: 14,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
            backgroundColor:
                theme.colors.surface,
        },

        listingImage: {
            width: 48,
            height: 48,
            borderRadius: 10,
        },

        listingImagePlaceholder: {
            width: 48,
            height: 48,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
                theme.colors.surfaceSecondary,
        },

        listingInfo: {
            flex: 1,
            marginLeft:
                theme.spacing.sm,
        },

        listingTitle: {
            color:
                theme.colors.text,
            fontSize: 13,
            fontWeight: "700",
        },

        listingPrice: {
            marginTop: 3,
            color:
                theme.colors.primary,
            fontSize: 13,
            fontWeight: "800",
        },

        messagesContainer: {
            flex: 1,
        },

        messagesContent: {
            paddingHorizontal:
                theme.spacing.md,
            paddingVertical:
                theme.spacing.lg,
        },

        messageRow: {
            width: "100%",
            marginBottom:
                theme.spacing.sm,
            flexDirection: "row",
        },

        messageRowOwn: {
            justifyContent:
                "flex-end",
        },

        messageRowOther: {
            justifyContent:
                "flex-start",
        },

        bubble: {
            maxWidth: "82%",
            paddingHorizontal: 13,
            paddingVertical: 9,
            borderRadius: 17,
        },

        bubbleOwn: {
            backgroundColor:
                theme.colors.primary,
            borderBottomRightRadius: 5,
        },

        bubbleOther: {
            backgroundColor:
                theme.colors.surface,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
            borderBottomLeftRadius: 5,
        },

        messageText: {
            fontSize: 14,
            lineHeight: 20,
        },

        messageTextOwn: {
            color:
                theme.colors.primaryText,
        },

        messageTextOther: {
            color:
                theme.colors.text,
        },

        messageTime: {
            marginTop: 4,
            fontSize: 9,
        },

        messageTimeOwn: {
            color: "rgba(255,255,255,0.70)",
            textAlign: "right",
        },

        messageTimeOther: {
            color:
                theme.colors.textMuted,
        },

        messageImage: {
            width: 220,
            height: 180,
            marginBottom: 6,
            borderRadius: 12,
        },

        emptyChat: {
            alignItems: "center",
            justifyContent: "center",
            paddingTop: 90,
            paddingHorizontal:
                theme.spacing.xl,
        },

        emptyIcon: {
            width: 64,
            height: 64,
            borderRadius: 32,
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
            fontSize: 18,
            fontWeight: "800",
        },

        emptyText: {
            marginTop:
                theme.spacing.sm,
            color:
                theme.colors.textSecondary,
            textAlign: "center",
            fontSize: 13,
            lineHeight: 20,
        },

        composer: {
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 7,
            paddingHorizontal:
                theme.spacing.sm,
            paddingVertical:
                theme.spacing.sm,
            borderTopWidth: 1,
            borderTopColor:
                theme.colors.border,
            backgroundColor:
                theme.colors.surface,
        },

        attachButton: {
            width: 42,
            height: 42,
            alignItems: "center",
            justifyContent: "center",
        },

        input: {
            flex: 1,
            maxHeight: 110,
            minHeight: 42,
            paddingHorizontal: 13,
            paddingVertical: 10,
            borderRadius: 21,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
            backgroundColor:
                theme.colors.surfaceSecondary,
            color:
                theme.colors.text,
            fontSize: 14,
        },

        sendButton: {
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: "center",
            justifyContent: "center",
        },
    });
}