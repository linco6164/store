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
    Dimensions,
    Image,
    Pressable,
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

const { width: SCREEN_WIDTH } =
    Dimensions.get("window");

export default function ListingDetailsScreen() {
    const { theme } = useTheme();

    const styles = useMemo(
        () => createStyles(theme),
        [theme]
    );

    const { id } =
        useLocalSearchParams<{
            id: string;
        }>();

    const [listing, setListing] =
        useState<Listing | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [
        currentImage,
        setCurrentImage,
    ] = useState(0);

    const loadListing =
        useCallback(async () => {
            if (!id) {
                setError(
                    "Anunț invalid."
                );
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data =
                    await listingService.getById(
                        id
                    );

                setListing(data);
            } catch (error) {
                console.error(
                    "Failed to load listing:",
                    error
                );

                setError(
                    "Nu am putut încărca anunțul."
                );
            } finally {
                setLoading(false);
            }
        }, [id]);

    useEffect(() => {
        loadListing();
    }, [loadListing]);

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
                        Se încarcă anunțul...
                    </Text>
                </View>
            </SafeScreen>
        );
    }

    if (error || !listing) {
        return (
            <SafeScreen>
                <View
                    style={
                        styles.errorScreen
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
                                theme.colors
                                    .text
                            }
                        />
                    </Pressable>

                    <View
                        style={
                            styles.errorIcon
                        }
                    >
                        <Ionicons
                            name="alert-circle-outline"
                            size={38}
                            color={
                                theme.colors
                                    .textMuted
                            }
                        />
                    </View>

                    <Text
                        style={
                            styles.errorTitle
                        }
                    >
                        {error ||
                            "Anunțul nu a fost găsit."}
                    </Text>

                    <Pressable
                        onPress={
                            loadListing
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
            </SafeScreen>
        );
    }

    const images =
        listing.images?.filter(Boolean) ??
        [];

    const image =
        images[currentImage];

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
                        styles.topBar
                    }
                >
                    <Pressable
                        onPress={() =>
                            router.back()
                        }
                        style={
                            styles.circleButton
                        }
                    >
                        <Ionicons
                            name="arrow-back"
                            size={21}
                            color={
                                theme.colors
                                    .text
                            }
                        />
                    </Pressable>

                    <View
                        style={
                            styles.topActions
                        }
                    >
                        <Pressable
                            style={
                                styles.circleButton
                            }
                        >
                            <Ionicons
                                name="share-outline"
                                size={20}
                                color={
                                    theme
                                        .colors
                                        .text
                                }
                            />
                        </Pressable>

                        <Pressable
                            style={
                                styles.circleButton
                            }
                        >
                            <Ionicons
                                name="heart-outline"
                                size={20}
                                color={
                                    theme
                                        .colors
                                        .text
                                }
                            />
                        </Pressable>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={
                        false
                    }
                    contentContainerStyle={
                        styles.content
                    }
                >
                    {/* IMAGE */}

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
                                    styles.mainImage
                                }
                                resizeMode="cover"
                            />
                        ) : (
                            <View
                                style={
                                    styles.noImage
                                }
                            >
                                <Ionicons
                                    name="image-outline"
                                    size={48}
                                    color={
                                        theme
                                            .colors
                                            .textMuted
                                    }
                                />

                                <Text
                                    style={
                                        styles.noImageText
                                    }
                                >
                                    No image
                                </Text>
                            </View>
                        )}

                        {images.length >
                        1 ? (
                            <View
                                style={
                                    styles.imageCounter
                                }
                            >
                                <Text
                                    style={
                                        styles.imageCounterText
                                    }
                                >
                                    {currentImage +
                                        1}{" "}
                                    /{" "}
                                    {
                                        images.length
                                    }
                                </Text>
                            </View>
                        ) : null}
                    </View>

                    {/* THUMBNAILS */}

                    {images.length >
                    1 ? (
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={
                                false
                            }
                            contentContainerStyle={
                                styles.thumbnails
                            }
                        >
                            {images.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <Pressable
                                        key={`${item}-${index}`}
                                        onPress={() =>
                                            setCurrentImage(
                                                index
                                            )
                                        }
                                        style={[
                                            styles.thumbnail,
                                            index ===
                                                currentImage &&
                                                styles.activeThumbnail,
                                        ]}
                                    >
                                        <Image
                                            source={{
                                                uri: item,
                                            }}
                                            style={
                                                styles.thumbnailImage
                                            }
                                        />
                                    </Pressable>
                                )
                            )}
                        </ScrollView>
                    ) : null}

                    {/* PRICE */}

                    <View
                        style={
                            styles.priceRow
                        }
                    >
                        <View>
                            <Text
                                style={
                                    styles.price
                                }
                            >
                                {formatPrice(
                                    listing.price,
                                    listing.currency
                                )}
                            </Text>

                            {listing.condition ? (
                                <Text
                                    style={
                                        styles.condition
                                    }
                                >
                                    {
                                        listing.condition
                                    }
                                </Text>
                            ) : null}
                        </View>

                        <Text
                            style={
                                styles.views
                            }
                        >
                            {listing.views ??
                                0}{" "}
                            views
                        </Text>
                    </View>

                    {/* TITLE */}

                    <Text
                        style={
                            styles.title
                        }
                    >
                        {listing.title}
                    </Text>

                    {/* LOCATION */}

                    {listing.city ? (
                        <View
                            style={
                                styles.location
                            }
                        >
                            <Ionicons
                                name="location-outline"
                                size={17}
                                color={
                                    theme
                                        .colors
                                        .textSecondary
                                }
                            />

                            <Text
                                style={
                                    styles.locationText
                                }
                            >
                                {listing.city}
                            </Text>
                        </View>
                    ) : null}

                    {/* DESCRIPTION */}

                    {listing.description ? (
                        <View
                            style={
                                styles.section
                            }
                        >
                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Description
                            </Text>

                            <Text
                                style={
                                    styles.description
                                }
                            >
                                {
                                    listing.description
                                }
                            </Text>
                        </View>
                    ) : null}

                    {/* DETAILS */}

                    <View
                        style={
                            styles.section
                        }
                    >
                        <Text
                            style={
                                styles.sectionTitle
                            }
                        >
                            Details
                        </Text>

                        <View
                            style={
                                styles.detailsCard
                            }
                        >
                            {listing.category ? (
                                <DetailRow
                                    icon="grid-outline"
                                    label="Category"
                                    value={
                                        listing.category
                                    }
                                    theme={
                                        theme
                                    }
                                />
                            ) : null}

                            {listing.condition ? (
                                <DetailRow
                                    icon="sparkles-outline"
                                    label="Condition"
                                    value={
                                        listing.condition
                                    }
                                    theme={
                                        theme
                                    }
                                />
                            ) : null}

                            {listing.city ? (
                                <DetailRow
                                    icon="location-outline"
                                    label="Location"
                                    value={
                                        listing.city
                                    }
                                    theme={
                                        theme
                                    }
                                />
                            ) : null}
                        </View>
                    </View>

                    {/* SELLER */}

                    {listing.seller ? (
                        <View
                            style={
                                styles.section
                            }
                        >
                            <Text
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Seller
                            </Text>

                            <Pressable
                                style={
                                    styles.sellerCard
                                }
                            >
                                <View
                                    style={
                                        styles.sellerAvatar
                                    }
                                >
                                    {listing
                                        .seller
                                        .avatar ? (
                                        <Image
                                            source={{
                                                uri: listing
                                                    .seller
                                                    .avatar,
                                            }}
                                            style={
                                                styles.sellerAvatarImage
                                            }
                                        />
                                    ) : (
                                        <Text
                                            style={
                                                styles.sellerInitial
                                            }
                                        >
                                            {listing
                                                .seller
                                                .username
                                                .charAt(
                                                    0
                                                )
                                                .toUpperCase()}
                                        </Text>
                                    )}
                                </View>

                                <View
                                    style={
                                        styles.sellerInfo
                                    }
                                >
                                    <View
                                        style={
                                            styles.sellerNameRow
                                        }
                                    >
                                        <Text
                                            style={
                                                styles.sellerName
                                            }
                                        >
                                            {
                                                listing
                                                    .seller
                                                    .username
                                            }
                                        </Text>

                                        {listing
                                            .seller
                                            .verified ? (
                                            <Ionicons
                                                name="checkmark-circle"
                                                size={
                                                    17
                                                }
                                                color={
                                                    theme
                                                        .colors
                                                        .primary
                                                }
                                            />
                                        ) : null}
                                    </View>

                                    {listing
                                        .seller
                                        .rating !==
                                    undefined ? (
                                        <View
                                            style={
                                                styles.rating
                                            }
                                        >
                                            <Ionicons
                                                name="star"
                                                size={
                                                    13
                                                }
                                                color={
                                                    theme
                                                        .colors
                                                        .warning
                                                }
                                            />

                                            <Text
                                                style={
                                                    styles.ratingText
                                                }
                                            >
                                                {
                                                    listing
                                                        .seller
                                                        .rating
                                                }
                                            </Text>
                                        </View>
                                    ) : null}
                                </View>

                                <Ionicons
                                    name="chevron-forward"
                                    size={
                                        18
                                    }
                                    color={
                                        theme
                                            .colors
                                            .textMuted
                                    }
                                />
                            </Pressable>
                        </View>
                    ) : null}

                    <View
                        style={
                            styles.bottomSpace
                        }
                    />
                </ScrollView>

                {/* ACTION BAR */}

                <View
                    style={
                        styles.bottomBar
                    }
                >
                    <Pressable
                        style={
                            styles.messageButton
                        }
                        onPress={() => {}}
                    >
                        <Ionicons
                            name="chatbubble-outline"
                            size={19}
                            color={
                                theme.colors
                                    .text
                            }
                        />

                        <Text
                            style={
                                styles.messageButtonText
                            }
                        >
                            Message
                        </Text>
                    </Pressable>

                    <Pressable
                        style={
                            styles.buyButton
                        }
                        onPress={() => {}}
                    >
                        <Text
                            style={
                                styles.buyButtonText
                            }
                        >
                            Buy now
                        </Text>
                    </Pressable>
                </View>
            </View>
        </SafeScreen>
    );
}

function DetailRow({
    icon,
    label,
    value,
    theme,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
    theme: ReturnType<
        typeof useTheme
    >["theme"];
}) {
    return (
        <View
            style={{
                flexDirection:
                    "row",
                alignItems:
                    "center",
                paddingVertical:
                    theme.spacing.sm,
            }}
        >
            <Ionicons
                name={icon}
                size={18}
                color={
                    theme.colors
                        .textSecondary
                }
            />

            <Text
                style={{
                    flex: 1,
                    marginLeft:
                        theme.spacing.md,
                    color:
                        theme.colors
                            .textSecondary,
                    fontSize: 12,
                }}
            >
                {label}
            </Text>

            <Text
                style={{
                    color:
                        theme.colors.text,
                    fontSize: 12,
                    fontWeight:
                        "700",
                }}
            >
                {value}
            </Text>
        </View>
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
        },

        topBar: {
            flexDirection:
                "row",
            alignItems:
                "center",
            justifyContent:
                "space-between",
            paddingHorizontal:
                theme.spacing.lg,
            paddingVertical:
                theme.spacing.sm,
        },

        topActions: {
            flexDirection:
                "row",
            gap:
                theme.spacing.sm,
        },

        circleButton: {
            width: 42,
            height: 42,
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

        content: {
            paddingBottom:
                110,
        },

        imageContainer: {
            width: SCREEN_WIDTH,
            aspectRatio: 0.9,
            backgroundColor:
                theme.colors
                    .surfaceSecondary,
            overflow: "hidden",
        },

        mainImage: {
            width: "100%",
            height: "100%",
        },

        noImage: {
            flex: 1,
            alignItems:
                "center",
            justifyContent:
                "center",
        },

        noImageText: {
            marginTop:
                theme.spacing.sm,
            color:
                theme.colors
                    .textMuted,
            fontSize: 12,
        },

        imageCounter: {
            position:
                "absolute",
            right: 14,
            bottom: 14,
            paddingHorizontal:
                theme.spacing.sm,
            paddingVertical:
                theme.spacing.xs,
            borderRadius:
                theme.radius.full,
            backgroundColor:
                "rgba(0,0,0,0.55)",
        },

        imageCounterText: {
            color: "#ffffff",
            fontSize: 10,
            fontWeight: "700",
        },

        thumbnails: {
            paddingHorizontal:
                theme.spacing.lg,
            paddingVertical:
                theme.spacing.md,
            gap:
                theme.spacing.sm,
        },

        thumbnail: {
            width: 58,
            height: 58,
            borderRadius:
                theme.radius.md,
            overflow: "hidden",
            borderWidth: 2,
            borderColor:
                "transparent",
        },

        activeThumbnail: {
            borderColor:
                theme.colors.primary,
        },

        thumbnailImage: {
            width: "100%",
            height: "100%",
        },

        priceRow: {
            flexDirection:
                "row",
            alignItems:
                "flex-end",
            justifyContent:
                "space-between",
            paddingHorizontal:
                theme.spacing.lg,
            marginTop:
                theme.spacing.md,
        },

        price: {
            color:
                theme.colors.text,
            fontSize: 25,
            fontWeight: "900",
        },

        condition: {
            marginTop: 3,
            color:
                theme.colors
                    .textSecondary,
            fontSize: 11,
        },

        views: {
            color:
                theme.colors.textMuted,
            fontSize: 10,
        },

        title: {
            marginTop:
                theme.spacing.md,
            paddingHorizontal:
                theme.spacing.lg,
            color:
                theme.colors.text,
            fontSize: 21,
            fontWeight: "900",
            lineHeight: 27,
        },

        location: {
            flexDirection:
                "row",
            alignItems:
                "center",
            paddingHorizontal:
                theme.spacing.lg,
            marginTop:
                theme.spacing.sm,
        },

        locationText: {
            marginLeft: 4,
            color:
                theme.colors
                    .textSecondary,
            fontSize: 12,
        },

        section: {
            marginTop:
                theme.spacing["2xl"],
            paddingHorizontal:
                theme.spacing.lg,
        },

        sectionTitle: {
            color:
                theme.colors.text,
            fontSize: 17,
            fontWeight: "900",
            marginBottom:
                theme.spacing.md,
        },

        description: {
            color:
                theme.colors
                    .textSecondary,
            fontSize: 13,
            lineHeight: 21,
        },

        detailsCard: {
            paddingHorizontal:
                theme.spacing.md,
            borderRadius:
                theme.radius.xl,
            backgroundColor:
                theme.colors.surface,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        sellerCard: {
            flexDirection:
                "row",
            alignItems:
                "center",
            padding:
                theme.spacing.md,
            borderRadius:
                theme.radius.xl,
            backgroundColor:
                theme.colors.surface,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        sellerAvatar: {
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems:
                "center",
            justifyContent:
                "center",
            overflow: "hidden",
            backgroundColor:
                theme.colors
                    .primarySoft,
        },

        sellerAvatarImage: {
            width: "100%",
            height: "100%",
        },

        sellerInitial: {
            color:
                theme.colors
                    .primaryDark,
            fontSize: 18,
            fontWeight: "900",
        },

        sellerInfo: {
            flex: 1,
            marginLeft:
                theme.spacing.md,
        },

        sellerNameRow: {
            flexDirection:
                "row",
            alignItems:
                "center",
            gap:
                theme.spacing.xs,
        },

        sellerName: {
            color:
                theme.colors.text,
            fontSize: 14,
            fontWeight: "800",
        },

        rating: {
            flexDirection:
                "row",
            alignItems:
                "center",
            marginTop: 4,
            gap: 3,
        },

        ratingText: {
            color:
                theme.colors
                    .textSecondary,
            fontSize: 11,
        },

        bottomSpace: {
            height: 30,
        },

        bottomBar: {
            position:
                "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            flexDirection:
                "row",
            alignItems:
                "center",
            gap:
                theme.spacing.sm,
            paddingHorizontal:
                theme.spacing.lg,
            paddingTop:
                theme.spacing.md,
            paddingBottom:
                theme.spacing.lg,
            backgroundColor:
                theme.colors.surface,
            borderTopWidth: 1,
            borderTopColor:
                theme.colors.border,
        },

        messageButton: {
            flex: 1,
            height: 48,
            flexDirection:
                "row",
            alignItems:
                "center",
            justifyContent:
                "center",
            gap:
                theme.spacing.sm,
            borderRadius:
                theme.radius.full,
            backgroundColor:
                theme.colors
                    .surfaceSecondary,
            borderWidth: 1,
            borderColor:
                theme.colors.border,
        },

        messageButtonText: {
            color:
                theme.colors.text,
            fontSize: 13,
            fontWeight: "800",
        },

        buyButton: {
            flex: 1.25,
            height: 48,
            alignItems:
                "center",
            justifyContent:
                "center",
            borderRadius:
                theme.radius.full,
            backgroundColor:
                theme.colors.primary,
        },

        buyButtonText: {
            color:
                theme.colors.primaryText,
            fontSize: 13,
            fontWeight: "900",
        },

        center: {
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

        backButton: {
            position:
                "absolute",
            top:
                theme.spacing.sm,
            left:
                theme.spacing.lg,
            width: 42,
            height: 42,
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

        errorIcon: {
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

        errorTitle: {
            marginTop:
                theme.spacing.lg,
            textAlign: "center",
            color:
                theme.colors.text,
            fontSize: 16,
            fontWeight: "800",
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
            fontWeight: "800",
        },
    });
}