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
    Image,
    Pressable,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { SafeScreen } from "@/components/SafeScreen";

import {
    Listing,
    listingService,
} from "@/services/listingService";

import { useTheme } from "@/theme";

type Category = {
    id: string;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    backendValue?: string;
};

const categories: Category[] = [
    {
        id: "all",
        title: "All",
        icon: "apps-outline",
    },
    {
        id: "fashion",
        title: "Fashion",
        icon: "shirt-outline",
        backendValue: "fashion",
    },
    {
        id: "electronics",
        title: "Electronics",
        icon: "phone-portrait-outline",
        backendValue: "electronics",
    },
    {
        id: "home",
        title: "Home",
        icon: "home-outline",
        backendValue: "home",
    },
    {
        id: "beauty",
        title: "Beauty",
        icon: "sparkles-outline",
        backendValue: "beauty",
    },
    {
        id: "sports",
        title: "Sports",
        icon: "football-outline",
        backendValue: "sports",
    },
];

export default function ExploreScreen() {
    const { theme } = useTheme();

    const styles = useMemo(
        () => createStyles(theme),
        [theme]
    );

    const [listings, setListings] =
        useState<Listing[]>([]);

    const [search, setSearch] =
        useState("");

    const [selectedCategory, setSelectedCategory] =
        useState("all");

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

                const category =
                    categories.find(
                        (item) =>
                            item.id ===
                            selectedCategory
                    );

                let data: Listing[];

                if (
                    search.trim() ||
                    category?.backendValue
                ) {
                    data =
                        await listingService.search({
                            category:
                                category?.backendValue,
                        });
                } else {
                    data =
                        await listingService.getAll();
                }

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
        }, [
            search,
            selectedCategory,
        ]);

    useEffect(() => {
        const timer =
            setTimeout(() => {
                loadListings();
            }, 350);

        return () =>
            clearTimeout(timer);
    }, [loadListings]);

    async function handleRefresh() {
        try {
            setRefreshing(true);
            await loadListings();
        } finally {
            setRefreshing(false);
        }
    }

    function handleCategory(
        categoryId: string
    ) {
        setSelectedCategory(
            categoryId
        );
    }

    function clearSearch() {
        setSearch("");
    }

    const renderHeader = () => (
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
                        Explore
                    </Text>

                    <Text
                        style={
                            styles.subtitle
                        }
                    >
                        Descoperă produse noi
                    </Text>
                </View>

                <Pressable
                    style={
                        styles.filterButton
                    }
                    onPress={() => {}}
                >
                    <Ionicons
                        name="options-outline"
                        size={21}
                        color={
                            theme.colors
                                .text
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
                    size={21}
                    color={
                        theme.colors
                            .textMuted
                    }
                />

                <TextInput
                    value={search}
                    onChangeText={
                        setSearch
                    }
                    placeholder="Search listings..."
                    placeholderTextColor={
                        theme.colors
                            .textMuted
                    }
                    returnKeyType="search"
                    style={
                        styles.searchInput
                    }
                />

                {search.length > 0 ? (
                    <Pressable
                        onPress={
                            clearSearch
                        }
                    >
                        <Ionicons
                            name="close-circle"
                            size={20}
                            color={
                                theme.colors
                                    .textMuted
                            }
                        />
                    </Pressable>
                ) : null}
            </View>

            {/* CATEGORIES */}

            <Text
                style={
                    styles.sectionTitle
                }
            >
                Categories
            </Text>

            <FlatList
                horizontal
                data={categories}
                keyExtractor={(item) =>
                    item.id
                }
                showsHorizontalScrollIndicator={
                    false
                }
                contentContainerStyle={
                    styles.categories
                }
                renderItem={({
                    item,
                }) => {
                    const active =
                        selectedCategory ===
                        item.id;

                    return (
                        <Pressable
                            onPress={() =>
                                handleCategory(
                                    item.id
                                )
                            }
                            style={[
                                styles.category,
                                active &&
                                    styles.categoryActive,
                            ]}
                        >
                            <Ionicons
                                name={
                                    item.icon
                                }
                                size={18}
                                color={
                                    active
                                        ? theme
                                              .colors
                                              .primaryText
                                        : theme
                                              .colors
                                              .textSecondary
                                }
                            />

                            <Text
                                style={[
                                    styles.categoryText,
                                    active &&
                                        styles.categoryTextActive,
                                ]}
                            >
                                {
                                    item.title
                                }
                            </Text>
                        </Pressable>
                    );
                }}
            />

            {/* PRODUCTS HEADER */}

            <View
                style={
                    styles.productsHeader
                }
            >
                <Text
                    style={
                        styles.sectionTitle
                    }
                >
                    Latest listings
                </Text>

                {!loading ? (
                    <Text
                        style={
                            styles.resultCount
                        }
                    >
                        {listings.length}{" "}
                        items
                    </Text>
                ) : null}
            </View>
        </>
    );

    return (
        <SafeScreen
            edges={[
                "top",
                "left",
                "right",
            ]}
        >
            {loading &&
            listings.length === 0 ? (
                <View
                    style={
                        styles.loadingScreen
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
                        Se încarcă anunțurile...
                    </Text>
                </View>
            ) : error &&
              listings.length === 0 ? (
                <View
                    style={
                        styles.errorScreen
                    }
                >
                    <Ionicons
                        name="cloud-offline-outline"
                        size={38}
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
                        {error}
                    </Text>

                    <Pressable
                        style={
                            styles.retryButton
                        }
                        onPress={
                            loadListings
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
                <FlatList
                    data={listings}
                    keyExtractor={(item) =>
                        item._id
                    }
                    numColumns={2}
                    showsVerticalScrollIndicator={
                        false
                    }
                    columnWrapperStyle={
                        styles.productRow
                    }
                    contentContainerStyle={
                        styles.content
                    }
                    ListHeaderComponent={
                        renderHeader
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
                    renderItem={({
                        item,
                    }) => (
                        <ListingCard
                            listing={item}
                            theme={theme}
                        />
                    )}
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
                                    name="search-outline"
                                    size={28}
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
                                No listings found
                            </Text>

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Încearcă o altă
                                căutare sau o
                                altă categorie.
                            </Text>
                        </View>
                    }
                />
            )}
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
            pathname:
                "/listing/[id]",
            params: {
                id: listing._id,
            },
        });
    }

    return (
        <Pressable
            style={({ pressed }) => [
                {
                    flex: 1,
                    maxWidth: "50%",
                },
                pressed && {
                    opacity: 0.8,
                },
            ]}
            onPress={
                openListing
            }
        >
            <View
                style={{
                    marginBottom:
                        theme.spacing.sm,
                    borderRadius:
                        theme.radius.lg,
                    overflow: "hidden",
                    backgroundColor:
                        theme.colors
                            .surface,
                    borderWidth: 1,
                    borderColor:
                        theme.colors
                            .border,
                }}
            >
                <View
                    style={{
                        aspectRatio: 1,
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
                                size={36}
                                color={
                                    theme
                                        .colors
                                        .textMuted
                                }
                            />
                        </View>
                    )}

                    <View
                        style={{
                            position:
                                "absolute",
                            top: 10,
                            right: 10,
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            alignItems:
                                "center",
                            justifyContent:
                                "center",
                            backgroundColor:
                                "rgba(255,255,255,0.92)",
                        }}
                    >
                        <Ionicons
                            name="heart-outline"
                            size={18}
                            color={
                                theme.colors
                                    .text
                            }
                        />
                    </View>
                </View>

                <View
                    style={{
                        padding:
                            theme.spacing.md,
                    }}
                >
                    <Text
                        numberOfLines={1}
                        style={{
                            color:
                                theme
                                    .colors
                                    .text,
                            fontSize: 14,
                            fontWeight:
                                "700",
                        }}
                    >
                        {
                            listing.title
                        }
                    </Text>

                    <Text
                        style={{
                            marginTop:
                                theme.spacing
                                    .xs,
                            color:
                                theme
                                    .colors
                                    .primary,
                            fontSize: 15,
                            fontWeight:
                                "800",
                        }}
                    >
                        {formatPrice(
                            listing.price,
                            listing.currency
                        )}
                    </Text>

                    {listing.city ? (
                        <View
                            style={{
                                flexDirection:
                                    "row",
                                alignItems:
                                    "center",
                                gap: 3,
                                marginTop:
                                    theme
                                        .spacing
                                        .xs,
                            }}
                        >
                            <Ionicons
                                name="location-outline"
                                size={12}
                                color={
                                    theme
                                        .colors
                                        .textMuted
                                }
                            />

                            <Text
                                numberOfLines={
                                    1
                                }
                                style={{
                                    flex: 1,
                                    color:
                                        theme
                                            .colors
                                            .textMuted,
                                    fontSize: 11,
                                }}
                            >
                                {
                                    listing.city
                                }
                            </Text>
                        </View>
                    ) : null}
                </View>
            </View>
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
            fontWeight: "900",
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

        filterButton: {
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
                theme.colors.surface,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        searchInput: {
            flex: 1,
            height: "100%",
            color:
                theme.colors.text,
            fontSize: 14,
        },

        sectionTitle: {
            marginTop:
                theme.spacing.lg,
            color:
                theme.colors.text,
            fontSize: 17,
            fontWeight: "800",
        },

        categories: {
            gap:
                theme.spacing.sm,
            paddingVertical:
                theme.spacing.lg,
        },

        category: {
            flexDirection:
                "row",
            alignItems:
                "center",
            gap:
                theme.spacing.xs,
            paddingHorizontal:
                theme.spacing.md,
            paddingVertical:
                theme.spacing.sm,
            borderRadius:
                theme.radius.full,
            backgroundColor:
                theme.colors.surface,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        categoryActive: {
            backgroundColor:
                theme.colors.primary,
            borderColor:
                theme.colors.primary,
        },

        categoryText: {
            color:
                theme.colors
                    .textSecondary,
            fontSize: 12,
            fontWeight: "700",
        },

        categoryTextActive: {
            color:
                theme.colors
                    .primaryText,
        },

        productsHeader: {
            flexDirection:
                "row",
            alignItems:
                "center",
            justifyContent:
                "space-between",
            marginBottom:
                theme.spacing.md,
        },

        resultCount: {
            color:
                theme.colors.textMuted,
            fontSize: 12,
        },

        productRow: {
            gap:
                theme.spacing.sm,
            marginBottom:
                theme.spacing.sm,
        },

        loadingScreen: {
            flex: 1,
            alignItems:
                "center",
            justifyContent:
                "center",
        },

        loadingText: {
            marginTop:
                theme.spacing.md,
            color:
                theme.colors
                    .textSecondary,
            fontSize: 13,
        },

        errorScreen: {
            flex: 1,
            alignItems:
                "center",
            justifyContent:
                "center",
            paddingHorizontal:
                theme.spacing.xl,
        },

        errorTitle: {
            marginTop:
                theme.spacing.lg,
            color:
                theme.colors.text,
            fontSize: 15,
            fontWeight:
                "700",
            textAlign:
                "center",
        },

        retryButton: {
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

        retryText: {
            color:
                theme.colors
                    .primaryText,
            fontSize: 12,
            fontWeight:
                "800",
        },

        empty: {
            alignItems:
                "center",
            justifyContent:
                "center",
            paddingVertical: 80,
        },

        emptyIcon: {
            width: 64,
            height: 64,
            borderRadius:
                theme.radius.full,
            alignItems:
                "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors
                    .surfaceSecondary,
            marginBottom:
                theme.spacing.lg,
        },

        emptyTitle: {
            color:
                theme.colors.text,
            fontSize: 17,
            fontWeight:
                "800",
        },

        emptyText: {
            marginTop:
                theme.spacing.sm,
            maxWidth: 260,
            textAlign:
                "center",
            color:
                theme.colors
                    .textSecondary,
            fontSize: 13,
            lineHeight: 20,
        },
    });
}