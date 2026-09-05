import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { SafeScreen } from "@/components/SafeScreen";
import {
    Listing,
    listingService,
} from "@/services/listingService";
import { useTheme } from "@/theme";

const categories = [
    {
        id: "1",
        name: "Women",
        icon: "woman-outline" as const,
    },
    {
        id: "2",
        name: "Men",
        icon: "man-outline" as const,
    },
    {
        id: "3",
        name: "Kids",
        icon: "happy-outline" as const,
    },
    {
        id: "4",
        name: "Electronics",
        icon: "phone-portrait-outline" as const,
    },
    {
        id: "5",
        name: "Home",
        icon: "home-outline" as const,
    },
    {
        id: "6",
        name: "Beauty",
        icon: "sparkles-outline" as const,
    },
];

export default function HomeScreen() {
    const { theme } = useTheme();

    const styles = useMemo(
        () => createStyles(theme),
        [theme]
    );

    const [listings, setListings] =
        useState<Listing[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const loadListings =
        useCallback(async () => {
            try {
                setError("");

                const data =
                    await listingService.getAll();

                setListings(data);
            } catch (error) {
                console.error(
                    "Failed to load listings:",
                    error
                );

                setError(
                    "Nu am putut încărca anunțurile."
                );
            } finally {
                setLoading(false);
            }
        }, []);

    useEffect(() => {
        loadListings();
    }, [loadListings]);

    async function handleRefresh() {
        try {
            setRefreshing(true);

            await loadListings();
        } finally {
            setRefreshing(false);
        }
    }

    return (
        <SafeScreen
            edges={[
                "top",
                "left",
                "right",
            ]}
        >
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={
                            handleRefresh
                        }
                        tintColor={
                            theme.colors
                                .primary
                        }
                    />
                }
                contentContainerStyle={
                    styles.content
                }
            >
                {/* HEADER */}

                <View style={styles.header}>
                    <View>
                        <Text
                            style={
                                styles.brand
                            }
                        >
                            nexora
                        </Text>

                        <Text
                            style={
                                styles.greeting
                            }
                        >
                            Discover something
                            you love
                        </Text>
                    </View>

                    <Pressable
                        style={
                            styles.notificationButton
                        }
                        onPress={() =>
                            router.push(
                                "/notifications"
                            )
                        }
                    >
                        <Ionicons
                            name="notifications-outline"
                            size={22}
                            color={
                                theme.colors
                                    .text
                            }
                        />

                        <View
                            style={
                                styles.notificationDot
                            }
                        />
                    </Pressable>
                </View>

                {/* SEARCH */}

                <Pressable
                    style={styles.search}
                    onPress={() =>
                        router.push(
                            "/(tabs)/explore"
                        )
                    }
                >
                    <Ionicons
                        name="search-outline"
                        size={20}
                        color={
                            theme.colors
                                .textMuted
                        }
                    />

                    <Text
                        style={
                            styles.searchText
                        }
                    >
                        Search for anything...
                    </Text>

                    <Ionicons
                        name="options-outline"
                        size={19}
                        color={
                            theme.colors
                                .textSecondary
                        }
                    />
                </Pressable>

                {/* SELL BANNER */}

                <View
                    style={
                        styles.sellBanner
                    }
                >
                    <View
                        style={
                            styles.sellBannerContent
                        }
                    >
                        <Text
                            style={
                                styles.sellBannerTitle
                            }
                        >
                            Sell what you don't
                            need
                        </Text>

                        <Text
                            style={
                                styles.sellBannerText
                            }
                        >
                            Turn your unused
                            items into money.
                        </Text>

                        <Pressable
                            style={
                                styles.sellButton
                            }
                            onPress={() =>
                                router.push(
                                    "/(tabs)/sell"
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.sellButtonText
                                }
                            >
                                Sell now
                            </Text>

                            <Ionicons
                                name="arrow-forward"
                                size={16}
                                color={
                                    theme.colors
                                        .primaryText
                                }
                            />
                        </Pressable>
                    </View>
                </View>

                {/* CATEGORIES */}

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
                        Categories
                    </Text>

                    <Pressable
                        onPress={() =>
                            router.push(
                                "/(tabs)/explore"
                            )
                        }
                    >
                        <Text
                            style={
                                styles.seeAll
                            }
                        >
                            See all
                        </Text>
                    </Pressable>
                </View>

                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.categories
                    }
                >
                    {categories.map(
                        (category) => (
                            <Pressable
                                key={
                                    category.id
                                }
                                style={
                                    styles.category
                                }
                                onPress={() =>
                                    router.push(
                                        "/(tabs)/explore"
                                    )
                                }
                            >
                                <View
                                    style={
                                        styles.categoryIcon
                                    }
                                >
                                    <Ionicons
                                        name={
                                            category.icon
                                        }
                                        size={23}
                                        color={
                                            theme
                                                .colors
                                                .primary
                                        }
                                    />
                                </View>

                                <Text
                                    style={
                                        styles.categoryText
                                    }
                                >
                                    {
                                        category.name
                                    }
                                </Text>
                            </Pressable>
                        )
                    )}
                </ScrollView>

                {/* RECOMMENDED */}

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
                        Recommended for you
                    </Text>

                    <Pressable
                        onPress={() =>
                            router.push(
                                "/(tabs)/explore"
                            )
                        }
                    >
                        <Text
                            style={
                                styles.seeAll
                            }
                        >
                            See all
                        </Text>
                    </Pressable>
                </View>

                {loading ? (
                    <View
                        style={
                            styles.loading
                        }
                    >
                        <ActivityIndicator
                            size="small"
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
                            Se încarcă
                            anunțurile...
                        </Text>
                    </View>
                ) : error ? (
                    <View
                        style={
                            styles.errorContainer
                        }
                    >
                        <Ionicons
                            name="cloud-offline-outline"
                            size={30}
                            color={
                                theme.colors
                                    .textMuted
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
                            onPress={
                                loadListings
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
                ) : listings.length ===
                    0 ? (
                    <View
                        style={
                            styles.empty
                        }
                    >
                        <Ionicons
                            name="bag-outline"
                            size={34}
                            color={
                                theme.colors
                                    .textMuted
                            }
                        />

                        <Text
                            style={
                                styles.emptyTitle
                            }
                        >
                            No listings yet
                        </Text>

                        <Text
                            style={
                                styles.emptyText
                            }
                        >
                            Fii primul care
                            publică un produs.
                        </Text>

                        <Pressable
                            style={
                                styles.emptyButton
                            }
                            onPress={() =>
                                router.push(
                                    "/(tabs)/sell"
                                )
                            }
                        >
                            <Text
                                style={
                                    styles.emptyButtonText
                                }
                            >
                                Sell something
                            </Text>
                        </Pressable>
                    </View>
                ) : (
                    <View
                        style={
                            styles.productGrid
                        }
                    >
                        {listings
                            .slice(0, 8)
                            .map(
                                (
                                    listing
                                ) => (
                                    <ListingCard
                                        key={
                                            listing._id
                                        }
                                        listing={
                                            listing
                                        }
                                        theme={
                                            theme
                                        }
                                    />
                                )
                            )}
                    </View>
                )}

                <View
                    style={
                        styles.bottomSpacer
                    }
                />
            </ScrollView>
        </SafeScreen>
    );
}

function ListingCard({
    listing,
    theme,
}: {
    listing: Listing;
    theme: ReturnType<
        typeof useTheme
    >["theme"];
}) {
    const image =
        listing.images?.[0];

    function openListing() {
        router.push({
            pathname: "/listing/[id]",
            params: {
                id: listing._id,
            },
        });
    }

    return (
        <Pressable
            style={
                {
                    width: "48%",
                }
            }
            onPress={
                openListing
            }
        >
            <View
                style={{
                    width: "100%",
                    aspectRatio: 0.82,
                    borderRadius:
                        theme.radius.xl,
                    overflow: "hidden",
                    backgroundColor:
                        theme.colors
                            .surfaceSecondary,
                }}
            >
                {image ? (
                    <Image
                        source={{
                            uri: image,
                        }}
                        style={{
                            width: "100%",
                            height: "100%",
                        }}
                        resizeMode="cover"
                    />
                ) : (
                    <View
                        style={{
                            flex: 1,
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                        }}
                    >
                        <Ionicons
                            name="image-outline"
                            size={32}
                            color={
                                theme.colors
                                    .textMuted
                            }
                        />
                    </View>
                )}

                <Pressable
                    style={{
                        position:
                            "absolute",
                        top: 9,
                        right: 9,
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                        backgroundColor:
                            "rgba(255,255,255,0.92)",
                    }}
                    onPress={(event) =>
                        event.stopPropagation()
                    }
                >
                    <Ionicons
                        name="heart-outline"
                        size={18}
                        color={
                            theme.colors
                                .text
                        }
                    />
                </Pressable>
            </View>

            <Text
                numberOfLines={1}
                style={{
                    marginTop:
                        theme.spacing.sm,
                    color:
                        theme.colors.text,
                    fontSize: 13,
                    fontWeight: "700",
                }}
            >
                {listing.title}
            </Text>

            <Text
                style={{
                    marginTop: 3,
                    color:
                        theme.colors.text,
                    fontSize: 14,
                    fontWeight: "900",
                }}
            >
                {formatPrice(
                    listing.price,
                    listing.currency
                )}
            </Text>

            {listing.city ? (
                <Text
                    numberOfLines={1}
                    style={{
                        marginTop: 2,
                        color:
                            theme.colors
                                .textMuted,
                        fontSize: 10,
                    }}
                >
                    {listing.city}
                </Text>
            ) : null}
        </Pressable>
    );
}

function formatPrice(
    price: number,
    currency = "EUR"
) {
    try {
        return new Intl.NumberFormat(
            "ro-RO",
            {
                style: "currency",
                currency,
                maximumFractionDigits: 2,
            }
        ).format(price);
    } catch {
        return `${price} ${currency}`;
    }
}

function createStyles(
    theme: ReturnType<
        typeof useTheme
    >["theme"]
) {
    return StyleSheet.create({
        content: {
            paddingHorizontal:
                theme.spacing.lg,
            paddingTop:
                theme.spacing.md,
            paddingBottom:
                theme.spacing["5xl"],
        },

        header: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent:
                "space-between",
            marginBottom:
                theme.spacing.lg,
        },

        brand: {
            color:
                theme.colors.text,
            fontSize: 29,
            fontWeight: "900",
            letterSpacing: -1.2,
        },

        greeting: {
            marginTop:
                theme.spacing.xs,
            color:
                theme.colors
                    .textSecondary,
            fontSize: 12,
        },

        notificationButton: {
            width: 44,
            height: 44,
            borderRadius:
                theme.radius.full,
            alignItems: "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors.surface,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        notificationDot: {
            position: "absolute",
            top: 9,
            right: 9,
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor:
                theme.colors.primary,
        },

        search: {
            height: 52,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal:
                theme.spacing.md,
            gap: theme.spacing.sm,
            borderRadius:
                theme.radius.full,
            backgroundColor:
                theme.colors.surface,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        searchText: {
            flex: 1,
            color:
                theme.colors.textMuted,
            fontSize: 13,
        },

        sellBanner: {
            marginTop:
                theme.spacing.lg,
            minHeight: 180,
            padding:
                theme.spacing.xl,
            borderRadius:
                theme.radius.xl,
            backgroundColor:
                theme.colors.primary,
            overflow: "hidden",
        },

        sellBannerContent: {
            maxWidth: "80%",
        },

        sellBannerTitle: {
            color:
                theme.colors.primaryText,
            fontSize: 23,
            fontWeight: "900",
            lineHeight: 28,
        },

        sellBannerText: {
            marginTop:
                theme.spacing.sm,
            color:
                theme.colors.primaryText,
            opacity: 0.8,
            fontSize: 12,
            lineHeight: 18,
        },

        sellButton: {
            alignSelf: "flex-start",
            flexDirection: "row",
            alignItems: "center",
            gap: theme.spacing.xs,
            marginTop:
                theme.spacing.lg,
            paddingHorizontal:
                theme.spacing.lg,
            height: 40,
            borderRadius:
                theme.radius.full,
            backgroundColor:
                theme.colors.surface,
        },

        sellButtonText: {
            color:
                theme.colors.text,
            fontSize: 12,
            fontWeight: "800",
        },

        sectionHeader: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent:
                "space-between",
            marginTop:
                theme.spacing["2xl"],
            marginBottom:
                theme.spacing.md,
        },

        sectionTitle: {
            color:
                theme.colors.text,
            fontSize: 18,
            fontWeight: "900",
        },

        seeAll: {
            color:
                theme.colors.primary,
            fontSize: 12,
            fontWeight: "800",
        },

        categories: {
            gap: theme.spacing.md,
            paddingRight:
                theme.spacing.lg,
        },

        category: {
            width: 76,
            alignItems: "center",
        },

        categoryIcon: {
            width: 58,
            height: 58,
            borderRadius: 29,
            alignItems: "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors.primarySoft,
        },

        categoryText: {
            marginTop:
                theme.spacing.xs,
            color:
                theme.colors
                    .textSecondary,
            fontSize: 10,
            fontWeight: "600",
            textAlign: "center",
        },

        productGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent:
                "space-between",
            rowGap:
                theme.spacing.lg,
        },

        loading: {
            minHeight: 180,
            alignItems:
                "center",
            justifyContent:
                "center",
        },

        loadingText: {
            marginTop:
                theme.spacing.sm,
            color:
                theme.colors
                    .textSecondary,
            fontSize: 12,
        },

        errorContainer: {
            minHeight: 220,
            alignItems:
                "center",
            justifyContent:
                "center",
            paddingHorizontal:
                theme.spacing.xl,
        },

        errorText: {
            marginTop:
                theme.spacing.md,
            textAlign: "center",
            color:
                theme.colors
                    .textSecondary,
            fontSize: 13,
        },

        retryButton: {
            marginTop:
                theme.spacing.md,
            paddingHorizontal:
                theme.spacing.lg,
            height: 40,
            borderRadius:
                theme.radius.full,
            alignItems:
                "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors.primary,
        },

        retryText: {
            color:
                theme.colors
                    .primaryText,
            fontSize: 12,
            fontWeight: "800",
        },

        empty: {
            minHeight: 250,
            alignItems:
                "center",
            justifyContent:
                "center",
            paddingHorizontal:
                theme.spacing.xl,
        },

        emptyTitle: {
            marginTop:
                theme.spacing.md,
            color:
                theme.colors.text,
            fontSize: 17,
            fontWeight: "800",
        },

        emptyText: {
            marginTop:
                theme.spacing.xs,
            textAlign: "center",
            color:
                theme.colors
                    .textSecondary,
            fontSize: 12,
        },

        emptyButton: {
            marginTop:
                theme.spacing.lg,
            paddingHorizontal:
                theme.spacing.lg,
            height: 42,
            borderRadius:
                theme.radius.full,
            alignItems:
                "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors.primary,
        },

        emptyButtonText: {
            color:
                theme.colors
                    .primaryText,
            fontSize: 12,
            fontWeight: "800",
        },

        bottomSpacer: {
            height: 30,
        },
    });
}