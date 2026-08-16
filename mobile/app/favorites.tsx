import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useMemo, useState } from "react";
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
import { favoriteService } from "@/services/favoriteService";
import { useTheme } from "@/theme";

type FavoriteItem = {
    _id?: string;
    id?: string;

    title?: string;
    price?: number;

    images?: string[];

    location?: string;

    listing?: {
        _id?: string;
        id?: string;
        title?: string;
        price?: number;
        images?: string[];
        location?: string;
    };
};

export default function FavoritesScreen() {
    const { theme } = useTheme();

    const styles = useMemo(
        () => createStyles(theme),
        [theme]
    );

    const [favorites, setFavorites] =
        useState<FavoriteItem[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [removingId, setRemovingId] =
        useState<string | null>(null);

    const loadFavorites = useCallback(
        async (
            isRefresh = false
        ) => {
            try {
                if (isRefresh) {
                    setRefreshing(true);
                } else {
                    setLoading(true);
                }

                setError("");

                const data =
                    await favoriteService.getAll();

                setFavorites(
                    Array.isArray(data)
                        ? data
                        : []
                );
            } catch (loadError) {
                console.error(
                    "Failed to load favorites:",
                    loadError
                );

                setError(
                    "Nu am putut încărca favoritele."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        []
    );

    useState(() => {
        loadFavorites();
    });

    function getListing(
        item: FavoriteItem
    ) {
        return item.listing ?? item;
    }

    function getListingId(
        item: FavoriteItem
    ) {
        const listing =
            getListing(item);

        return (
            listing._id ??
            listing.id ??
            item._id ??
            item.id ??
            ""
        );
    }

    async function handleRemove(
        item: FavoriteItem
    ) {
        const listingId =
            getListingId(item);

        if (
            !listingId ||
            removingId
        ) {
            return;
        }

        try {
            setRemovingId(listingId);

            await favoriteService.remove(
                listingId
            );

            setFavorites(
                (current) =>
                    current.filter(
                        (favorite) =>
                            getListingId(
                                favorite
                            ) !==
                            listingId
                    )
            );
        } catch (removeError) {
            console.error(
                "Failed to remove favorite:",
                removeError
            );
        } finally {
            setRemovingId(null);
        }
    }

    function handleOpen(
        item: FavoriteItem
    ) {
        const listingId =
            getListingId(item);

        if (!listingId) {
            return;
        }

        router.push(
            `/listing/${listingId}`
        );
    }

    function renderItem({
        item,
    }: {
        item: FavoriteItem;
    }) {
        const listing =
            getListing(item);

        const listingId =
            getListingId(item);

        const title =
            listing.title ??
            "Anunț";

        const price =
            listing.price;

        const images =
            listing.images ?? [];

        const image =
            images[0];

        return (
            <Pressable
                onPress={() =>
                    handleOpen(item)
                }
                style={({ pressed }) => [
                    styles.card,
                    {
                        opacity:
                            pressed
                                ? 0.75
                                : 1,
                    },
                ]}
            >
                <View
                    style={
                        styles.imageContainer
                    }
                >
                    {image ? (
                        <Image
                            source={{
                                uri: image,
                            }}
                            style={
                                styles.image
                            }
                            contentFit="cover"
                            transition={150}
                        />
                    ) : (
                        <View
                            style={
                                styles.imagePlaceholder
                            }
                        >
                            <Ionicons
                                name="image-outline"
                                size={30}
                                color={
                                    theme.colors
                                        .textMuted
                                }
                            />
                        </View>
                    )}

                    <Pressable
                        onPress={() =>
                            handleRemove(
                                item
                            )
                        }
                        disabled={
                            removingId ===
                            listingId
                        }
                        style={
                            styles.favoriteButton
                        }
                        hitSlop={8}
                    >
                        {removingId ===
                        listingId ? (
                            <ActivityIndicator
                                size="small"
                                color={
                                    theme.colors
                                        .primary
                                }
                            />
                        ) : (
                            <Ionicons
                                name="heart"
                                size={20}
                                color={
                                    theme.colors
                                        .primary
                                }
                            />
                        )}
                    </Pressable>
                </View>

                <View
                    style={
                        styles.cardContent
                    }
                >
                    <Text
                        numberOfLines={2}
                        style={
                            styles.title
                        }
                    >
                        {title}
                    </Text>

                    {typeof price ===
                    "number" ? (
                        <Text
                            style={
                                styles.price
                            }
                        >
                            {formatPrice(
                                price
                            )}{" "}
                            Lei
                        </Text>
                    ) : null}

                    {listing.location ? (
                        <View
                            style={
                                styles.locationRow
                            }
                        >
                            <Ionicons
                                name="location-outline"
                                size={13}
                                color={
                                    theme.colors
                                        .textMuted
                                }
                            />

                            <Text
                                numberOfLines={
                                    1
                                }
                                style={
                                    styles.location
                                }
                            >
                                {
                                    listing.location
                                }
                            </Text>
                        </View>
                    ) : null}
                </View>
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
                        Se încarcă favoritele...
                    </Text>
                </View>
            </SafeScreen>
        );
    }

    if (error) {
        return (
            <SafeScreen>
                <View
                    style={
                        styles.container
                    }
                >
                    <Header
                        styles={styles}
                        theme={theme}
                    />

                    <View
                        style={
                            styles.center
                        }
                    >
                        <View
                            style={
                                styles.emptyIcon
                            }
                        >
                            <Ionicons
                                name="heart-dislike-outline"
                                size={32}
                                color={
                                    theme.colors
                                        .textMuted
                                }
                            />
                        </View>

                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            Nu am putut încărca
                        </Text>

                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            {error}
                        </Text>

                        <Pressable
                            onPress={() =>
                                loadFavorites()
                            }
                            style={
                                styles.retryButton
                            }
                        >
                            <Ionicons
                                name="refresh"
                                size={18}
                                color={
                                    theme.colors
                                        .primaryText
                                }
                            />

                            <Text
                                style={
                                    styles.retryText
                                }
                            >
                                Încearcă din nou
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </SafeScreen>
        );
    }

    return (
        <SafeScreen>
            <View
                style={
                    styles.container
                }
            >
                <Header
                    styles={styles}
                    theme={theme}
                />

                <FlatList
                    data={favorites}
                    keyExtractor={(
                        item,
                        index
                    ) =>
                        getListingId(
                            item
                        ) ||
                        `favorite-${index}`
                    }
                    renderItem={
                        renderItem
                    }
                    numColumns={2}
                    columnWrapperStyle={
                        favorites.length > 1
                            ? styles.row
                            : undefined
                    }
                    contentContainerStyle={[
                        styles.listContent,
                        favorites.length ===
                            0 &&
                            styles.emptyList,
                    ]}
                    showsVerticalScrollIndicator={
                        false
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={
                                refreshing
                            }
                            onRefresh={() =>
                                loadFavorites(
                                    true
                                )
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
                                styles.emptyState
                            }
                        >
                            <View
                                style={
                                    styles.emptyIcon
                                }
                            >
                                <Ionicons
                                    name="heart-outline"
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
                                Nu ai favorite încă
                            </Text>

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Salvează anunțurile care
                                îți plac pentru a le găsi
                                rapid aici.
                            </Text>

                            <Pressable
                                onPress={() =>
                                    router.push(
                                        "/explore"
                                    )
                                }
                                style={
                                    styles.exploreButton
                                }
                            >
                                <Ionicons
                                    name="search-outline"
                                    size={18}
                                    color={
                                        theme.colors
                                            .primaryText
                                    }
                                />

                                <Text
                                    style={
                                        styles.exploreButtonText
                                    }
                                >
                                    Explorează anunțuri
                                </Text>
                            </Pressable>
                        </View>
                    }
                />
            </View>
        </SafeScreen>
    );
}

function Header({
    styles,
    theme,
}: {
    styles: ReturnType<
        typeof createStyles
    >;
    theme: ReturnType<
        typeof useTheme
    >["theme"];
}) {
    return (
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

            <Text
                style={
                    styles.headerTitle
                }
            >
                Favorite
            </Text>

            <View
                style={
                    styles.headerSpacer
                }
            />
        </View>
    );
}

function formatPrice(
    price: number
) {
    return new Intl.NumberFormat(
        "ro-RO"
    ).format(price);
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

        listContent: {
            paddingHorizontal:
                theme.spacing.md,
            paddingTop:
                theme.spacing.md,
            paddingBottom: 30,
        },

        row: {
            justifyContent:
                "space-between",
        },

        card: {
            width: "48.2%",
            marginBottom:
                theme.spacing.md,
            overflow: "hidden",
            borderRadius: 14,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
            backgroundColor:
                theme.colors.surface,
        },

        imageContainer: {
            width: "100%",
            height: 185,
            position: "relative",
            backgroundColor:
                theme.colors.surfaceSecondary,
        },

        image: {
            width: "100%",
            height: "100%",
        },

        imagePlaceholder: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor:
                theme.colors.surfaceSecondary,
        },

        favoriteButton: {
            position: "absolute",
            top: 9,
            right: 9,
            width: 36,
            height: 36,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 18,
            backgroundColor:
                "rgba(255,255,255,0.92)",
        },

        cardContent: {
            padding: 11,
        },

        title: {
            minHeight: 38,
            color: theme.colors.text,
            fontSize: 13,
            lineHeight: 18,
            fontWeight: "700",
        },

        price: {
            marginTop: 6,
            color: theme.colors.primary,
            fontSize: 15,
            fontWeight: "800",
        },

        locationRow: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: 6,
            gap: 3,
        },

        location: {
            flex: 1,
            color:
                theme.colors.textMuted,
            fontSize: 10,
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
            fontSize: 13,
        },

        emptyList: {
            flexGrow: 1,
        },

        emptyState: {
            flex: 1,
            minHeight: 500,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal:
                theme.spacing.xl,
        },

        emptyIcon: {
            width: 72,
            height: 72,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 36,
            backgroundColor:
                theme.colors.primarySoft,
        },

        emptyTitle: {
            marginTop:
                theme.spacing.lg,
            color: theme.colors.text,
            fontSize: 19,
            fontWeight: "800",
            textAlign: "center",
        },

        emptyText: {
            maxWidth: 310,
            marginTop:
                theme.spacing.sm,
            color:
                theme.colors.textSecondary,
            fontSize: 13,
            lineHeight: 20,
            textAlign: "center",
        },

        exploreButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 48,
            marginTop:
                theme.spacing.lg,
            paddingHorizontal:
                theme.spacing.lg,
            borderRadius: 13,
            backgroundColor:
                theme.colors.primary,
            gap: 7,
        },

        exploreButtonText: {
            color:
                theme.colors.primaryText,
            fontSize: 13,
            fontWeight: "800",
        },

        retryButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 46,
            marginTop:
                theme.spacing.lg,
            paddingHorizontal:
                theme.spacing.lg,
            borderRadius: 13,
            backgroundColor:
                theme.colors.primary,
            gap: 7,
        },

        retryText: {
            color:
                theme.colors.primaryText,
            fontSize: 13,
            fontWeight: "800",
        },
    });
}