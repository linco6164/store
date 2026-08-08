import { useState } from "react";

import {
    Alert,
    Pressable,
    ScrollView,
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

export default function SellScreen() {
    const { theme } =
        useTheme();

    const [title, setTitle] =
        useState("");

    const [description, setDescription] =
        useState("");

    const [price, setPrice] =
        useState("");

    const [category, setCategory] =
        useState("");

    const styles =
        createStyles(theme);

    function handlePublish() {
        if (!title.trim()) {
            Alert.alert(
                "Lipsește titlul",
                "Introdu un titlu pentru anunț."
            );
            return;
        }

        if (!price.trim()) {
            Alert.alert(
                "Lipsește prețul",
                "Introdu prețul produsului."
            );
            return;
        }

        Alert.alert(
            "În curând",
            "Publicarea anunțului va fi conectată la backend."
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
                keyboardShouldPersistTaps="handled"
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
                            Sell
                        </Text>

                        <Text
                            style={
                                styles.subtitle
                            }
                        >
                            Creează un anunț nou
                        </Text>
                    </View>

                    <View
                        style={
                            styles.headerIcon
                        }
                    >
                        <Ionicons
                            name="pricetag-outline"
                            size={22}
                            color={
                                theme
                                    .colors
                                    .primary
                            }
                        />
                    </View>
                </View>

                {/* PHOTOS */}

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
                        Photos
                    </Text>

                    <Text
                        style={
                            styles.sectionDescription
                        }
                    >
                        Adaugă fotografii clare
                        pentru produsul tău.
                    </Text>

                    <View
                        style={
                            styles.photoGrid
                        }
                    >
                        <Pressable
                            style={
                                styles.addPhoto
                            }
                            onPress={() =>
                                Alert.alert(
                                    "Photos",
                                    "Galeria foto va fi conectată în următorul pas."
                                )
                            }
                        >
                            <View
                                style={
                                    styles.addPhotoIcon
                                }
                            >
                                <Ionicons
                                    name="camera-outline"
                                    size={25}
                                    color={
                                        theme
                                            .colors
                                            .primary
                                    }
                                />
                            </View>

                            <Text
                                style={
                                    styles.addPhotoText
                                }
                            >
                                Add photos
                            </Text>

                            <Text
                                style={
                                    styles.photoHint
                                }
                            >
                                Până la 10 fotografii
                            </Text>
                        </Pressable>
                    </View>
                </View>

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

                    {/* TITLE */}

                    <View
                        style={
                            styles.field
                        }
                    >
                        <Text
                            style={
                                styles.label
                            }
                        >
                            Title
                        </Text>

                        <TextInput
                            value={title}
                            onChangeText={
                                setTitle
                            }
                            placeholder="Ex. Nike Air Max 270"
                            placeholderTextColor={
                                theme
                                    .colors
                                    .textMuted
                            }
                            style={
                                styles.input
                            }
                            maxLength={80}
                        />

                        <Text
                            style={
                                styles.counter
                            }
                        >
                            {title.length}/80
                        </Text>
                    </View>

                    {/* CATEGORY */}

                    <View
                        style={
                            styles.field
                        }
                    >
                        <Text
                            style={
                                styles.label
                            }
                        >
                            Category
                        </Text>

                        <Pressable
                            onPress={() =>
                                Alert.alert(
                                    "Category",
                                    "Selectorul de categorii va fi conectat în următorul pas."
                                )
                            }
                            style={
                                styles.select
                            }
                        >
                            <View
                                style={
                                    styles.selectLeft
                                }
                            >
                                <Ionicons
                                    name="grid-outline"
                                    size={19}
                                    color={
                                        theme
                                            .colors
                                            .textSecondary
                                    }
                                />

                                <Text
                                    style={[
                                        styles.selectText,
                                        !category &&
                                            styles.placeholder,
                                    ]}
                                >
                                    {category ||
                                        "Selectează categoria"}
                                </Text>
                            </View>

                            <Ionicons
                                name="chevron-down"
                                size={19}
                                color={
                                    theme
                                        .colors
                                        .textMuted
                                }
                            />
                        </Pressable>
                    </View>

                    {/* DESCRIPTION */}

                    <View
                        style={
                            styles.field
                        }
                    >
                        <Text
                            style={
                                styles.label
                            }
                        >
                            Description
                        </Text>

                        <TextInput
                            value={
                                description
                            }
                            onChangeText={
                                setDescription
                            }
                            placeholder="Descrie produsul, starea lui și orice alte detalii importante..."
                            placeholderTextColor={
                                theme
                                    .colors
                                    .textMuted
                            }
                            multiline
                            textAlignVertical="top"
                            style={[
                                styles.input,
                                styles.textarea,
                            ]}
                            maxLength={1000}
                        />

                        <Text
                            style={
                                styles.counter
                            }
                        >
                            {
                                description.length
                            }
                            /1000
                        </Text>
                    </View>
                </View>

                {/* PRICE */}

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
                        Price
                    </Text>

                    <View
                        style={
                            styles.priceWrapper
                        }
                    >
                        <Text
                            style={
                                styles.currency
                            }
                        >
                            RON
                        </Text>

                        <TextInput
                            value={price}
                            onChangeText={
                                setPrice
                            }
                            placeholder="0.00"
                            placeholderTextColor={
                                theme
                                    .colors
                                    .textMuted
                            }
                            keyboardType="decimal-pad"
                            style={
                                styles.priceInput
                            }
                        />
                    </View>
                </View>

                {/* PUBLISH */}

                <Pressable
                    onPress={
                        handlePublish
                    }
                    style={({ pressed }) => [
                        styles.publishButton,

                        pressed &&
                            styles.pressed,
                    ]}
                >
                    <Ionicons
                        name="rocket-outline"
                        size={20}
                        color={
                            theme
                                .colors
                                .primaryText
                        }
                    />

                    <Text
                        style={
                            styles.publishText
                        }
                    >
                        Publish listing
                    </Text>
                </Pressable>

                <Text
                    style={
                        styles.footer
                    }
                >
                    Prin publicarea anunțului,
                    ești de acord cu termenii
                    Nexora.
                </Text>
            </ScrollView>
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

        header: {
            flexDirection:
                "row",
            alignItems:
                "center",
            justifyContent:
                "space-between",
            marginBottom:
                theme.spacing["2xl"],
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

        headerIcon: {
            width: 46,
            height: 46,
            borderRadius:
                theme.radius.full,
            alignItems:
                "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors
                    .primarySoft,
        },

        section: {
            marginBottom:
                theme.spacing["2xl"],
        },

        sectionTitle: {
            color:
                theme.colors.text,
            fontSize: 18,
            fontWeight:
                "800",
        },

        sectionDescription: {
            marginTop:
                theme.spacing.xs,
            marginBottom:
                theme.spacing.md,
            color:
                theme.colors
                    .textSecondary,
            fontSize: 13,
            lineHeight: 20,
        },

        photoGrid: {
            flexDirection:
                "row",
        },

        addPhoto: {
            width: 150,
            height: 150,
            alignItems:
                "center",
            justifyContent:
                "center",
            borderRadius:
                theme.radius.lg,
            borderWidth: 1.5,
            borderStyle:
                "dashed",
            borderColor:
                theme.colors
                    .borderStrong,
            backgroundColor:
                theme.colors
                    .surface,
        },

        addPhotoIcon: {
            width: 48,
            height: 48,
            borderRadius:
                theme.radius.full,
            alignItems:
                "center",
            justifyContent:
                "center",
            backgroundColor:
                theme.colors
                    .primarySoft,
            marginBottom:
                theme.spacing.sm,
        },

        addPhotoText: {
            color:
                theme.colors.text,
            fontSize: 13,
            fontWeight:
                "700",
        },

        photoHint: {
            marginTop:
                theme.spacing.xs,
            color:
                theme.colors
                    .textMuted,
            fontSize: 10,
        },

        field: {
            marginTop:
                theme.spacing.lg,
        },

        label: {
            marginBottom:
                theme.spacing.sm,
            color:
                theme.colors.text,
            fontSize: 13,
            fontWeight:
                "700",
        },

        input: {
            minHeight: 52,
            paddingHorizontal:
                theme.spacing.md,
            borderRadius:
                theme.radius.md,
            borderWidth: 1,
            borderColor:
                theme.colors
                    .border,
            backgroundColor:
                theme.colors
                    .surface,
            color:
                theme.colors.text,
            fontSize: 14,
        },

        textarea: {
            minHeight: 130,
            paddingTop:
                theme.spacing.md,
        },

        counter: {
            alignSelf:
                "flex-end",
            marginTop:
                theme.spacing.xs,
            color:
                theme.colors
                    .textMuted,
            fontSize: 10,
        },

        select: {
            minHeight: 52,
            flexDirection:
                "row",
            alignItems:
                "center",
            justifyContent:
                "space-between",
            paddingHorizontal:
                theme.spacing.md,
            borderRadius:
                theme.radius.md,
            borderWidth: 1,
            borderColor:
                theme.colors
                    .border,
            backgroundColor:
                theme.colors
                    .surface,
        },

        selectLeft: {
            flexDirection:
                "row",
            alignItems:
                "center",
            gap:
                theme.spacing.sm,
        },

        selectText: {
            color:
                theme.colors.text,
            fontSize: 14,
        },

        placeholder: {
            color:
                theme.colors
                    .textMuted,
        },

        priceWrapper: {
            minHeight: 58,
            flexDirection:
                "row",
            alignItems:
                "center",
            paddingHorizontal:
                theme.spacing.lg,
            borderRadius:
                theme.radius.md,
            borderWidth: 1,
            borderColor:
                theme.colors
                    .border,
            backgroundColor:
                theme.colors
                    .surface,
        },

        currency: {
            color:
                theme.colors
                    .textSecondary,
            fontSize: 13,
            fontWeight:
                "800",
            marginRight:
                theme.spacing.md,
        },

        priceInput: {
            flex: 1,
            height: 56,
            color:
                theme.colors.text,
            fontSize: 22,
            fontWeight:
                "800",
        },

        publishButton: {
            height: 54,
            flexDirection:
                "row",
            alignItems:
                "center",
            justifyContent:
                "center",
            gap:
                theme.spacing.sm,
            borderRadius:
                theme.radius.md,
            backgroundColor:
                theme.colors
                    .primary,
        },

        publishText: {
            color:
                theme.colors
                    .primaryText,
            fontSize: 15,
            fontWeight:
                "800",
        },

        pressed: {
            opacity: 0.82,
            transform: [
                {
                    scale: 0.99,
                },
            ],
        },

        footer: {
            marginTop:
                theme.spacing.md,
            textAlign:
                "center",
            color:
                theme.colors
                    .textMuted,
            fontSize: 11,
            lineHeight: 17,
        },
    });
}