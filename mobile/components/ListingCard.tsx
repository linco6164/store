import {
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
    Listing,
} from "@/services/listingService";

import {
    favoriteService,
} from "@/services/favoriteService";

import { useTheme } from "@/theme";

interface Props {
    listing: Listing;
}

export default function ListingCard({
    listing,
}: Props) {
    const { theme } = useTheme();

    const [favorite, setFavorite] =
        useState(false);

    const [toggling, setToggling] =
        useState(false);

    const image =
        listing.images?.[0];

    useEffect(() => {
        let mounted = true;

        async function loadFavorite() {
            try {
                const result =
                    await favoriteService.check(
                        listing._id
                    );

                if (mounted) {
                    setFavorite(result);
                }
            } catch (error) {
                console.error(
                    "Failed to check favorite:",
                    error
                );
            }
        }

        loadFavorite();

        return () => {
            mounted = false;
        };
    }, [listing._id]);

    async function handleFavorite(
        event: any
    ) {
        event.stopPropagation();

        if (toggling) {
            return;
        }

        try {
            setToggling(true);

            const result =
                await favoriteService.toggle(
                    listing._id
                );

            setFavorite(
                result.favorite
            );
        } catch (error) {
            console.error(
                "Failed to toggle favorite:",
                error
            );
        } finally {
            setToggling(false);
        }
    }

    function handlePress() {
        router.push(
            `/listing/${listing._id}`
        );
    }

    return (
        <Pressable
            onPress={handlePress}
            style={[
                styles.card,
                {
                    backgroundColor:
                        theme.colors.surface,
                    borderColor:
                        theme.colors.border,
                },
            ]}
        >
            <View style={styles.imageContainer}>
                {image ? (
                    <Image
                        source={{
                            uri: image,
                        }}
                        style={styles.image}
                        resizeMode="cover"
                    />
                ) : (
                    <View
                        style={[
                            styles.imagePlaceholder,
                            {
                                backgroundColor:
                                    theme.colors
                                        .background,
                            },
                        ]}
                    >
                        <Ionicons
                            name="image-outline"
                            size={34}
                            color={
                                theme.colors
                                    .textMuted
                            }
                        />
                    </View>
                )}

                {listing.condition && (
                    <View
                        style={[
                            styles.conditionBadge,
                            {
                                backgroundColor:
                                    theme.colors
                                        .surface,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.conditionText,
                                {
                                    color:
                                        theme.colors
                                            .text,
                                },
                            ]}
                        >
                            {listing.condition}
                        </Text>
                    </View>
                )}

                <Pressable
                    onPress={handleFavorite}
                    disabled={toggling}
                    hitSlop={8}
                    style={[
                        styles.favoriteButton,
                        {
                            backgroundColor:
                                theme.colors.surface,
                        },
                    ]}
                >
                    <Ionicons
                        name={
                            favorite
                                ? "heart"
                                : "heart-outline"
                        }
                        size={20}
                        color={
                            favorite
                                ? "#ef4444"
                                : theme.colors.text
                        }
                    />
                </Pressable>
            </View>

            <View style={styles.content}>
                <Text
                    numberOfLines={2}
                    style={[
                        styles.title,
                        {
                            color:
                                theme.colors.text,
                        },
                    ]}
                >
                    {listing.title}
                </Text>

                <Text
                    style={[
                        styles.price,
                        {
                            color:
                                theme.colors.primary,
                        },
                    ]}
                >
                    {listing.price}{" "}
                    {listing.currency || "RON"}
                </Text>

                <View
                    style={
                        styles.locationRow
                    }
                >
                    <Ionicons
                        name="location-outline"
                        size={14}
                        color={
                            theme.colors
                                .textMuted
                        }
                    />

                    <Text
                        numberOfLines={1}
                        style={[
                            styles.location,
                            {
                                color:
                                    theme.colors
                                        .textMuted,
                            },
                        ]}
                    >
                        {listing.city ||
                            "România"}
                    </Text>
                </View>

                {listing.seller && (
                    <View
                        style={
                            styles.sellerRow
                        }
                    >
                        <View
                            style={[
                                styles.avatar,
                                {
                                    backgroundColor:
                                        theme.colors
                                            .background,
                                },
                            ]}
                        >
                            {listing.seller
                                .avatar ? (
                                <Image
                                    source={{
                                        uri: listing
                                            .seller
                                            .avatar,
                                    }}
                                    style={
                                        styles.avatarImage
                                    }
                                />
                            ) : (
                                <Ionicons
                                    name="person-outline"
                                    size={15}
                                    color={
                                        theme.colors
                                            .textMuted
                                    }
                                />
                            )}
                        </View>

                        <Text
                            numberOfLines={1}
                            style={[
                                styles.username,
                                {
                                    color:
                                        theme.colors
                                            .textMuted,
                                },
                            ]}
                        >
                            {
                                listing.seller
                                    .username
                            }
                        </Text>

                        {listing.seller
                            .verified && (
                            <Ionicons
                                name="checkmark-circle"
                                size={15}
                                color={
                                    theme.colors
                                        .primary
                                }
                            />
                        )}
                    </View>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        width: "100%",
        borderWidth: 1,
        borderRadius: 18,
        overflow: "hidden",
    },

    imageContainer: {
        position: "relative",
        width: "100%",
        aspectRatio: 1,
    },

    image: {
        width: "100%",
        height: "100%",
    },

    imagePlaceholder: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },

    favoriteButton: {
        position: "absolute",
        top: 10,
        right: 10,
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 5,
        shadowOffset: {
            width: 0,
            height: 2,
        },
    },

    conditionBadge: {
        position: "absolute",
        left: 10,
        bottom: 10,
        paddingHorizontal: 9,
        paddingVertical: 5,
        borderRadius: 10,
    },

    conditionText: {
        fontSize: 11,
        fontWeight: "600",
    },

    content: {
        padding: 13,
        gap: 6,
    },

    title: {
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 19,
    },

    price: {
        fontSize: 17,
        fontWeight: "800",
        marginTop: 2,
    },

    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        marginTop: 2,
    },

    location: {
        flex: 1,
        fontSize: 12,
    },

    sellerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 5,
    },

    avatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },

    avatarImage: {
        width: "100%",
        height: "100%",
    },

    username: {
        flex: 1,
        fontSize: 12,
        fontWeight: "500",
    },
});