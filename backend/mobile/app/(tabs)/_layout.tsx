import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import {
    Text,
    View,
} from "react-native";

import { useTheme } from "@/theme";

import {
    useNotifications,
} from "@/context/NotificationContext";

export default function TabLayout() {
    const { theme } =
        useTheme();

    const {
        unreadCount,
    } = useNotifications();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor:
                    theme.colors.primary,

                tabBarInactiveTintColor:
                    theme.colors.textMuted,

                tabBarHideOnKeyboard:
                    true,

                tabBarStyle: {
                    height: 64,
                    paddingTop: 6,
                    paddingBottom: 8,

                    borderTopWidth: 1,

                    borderTopColor:
                        theme.colors.border,

                    backgroundColor:
                        theme.colors.surface,
                },

                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: "600",
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",

                    tabBarIcon: ({
                        color,
                    }) => (
                        <Ionicons
                            name="home-outline"
                            size={23}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="explore"
                options={{
                    title: "Explore",

                    tabBarIcon: ({
                        color,
                    }) => (
                        <Ionicons
                            name="search-outline"
                            size={23}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="sell"
                options={{
                    title: "Sell",

                    tabBarIcon: ({
                        color,
                    }) => (
                        <Ionicons
                            name="add-circle-outline"
                            size={25}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="messages"
                options={{
                    title: "Messages",

                    tabBarIcon: ({
                        color,
                    }) => (
                        <Ionicons
                            name="chatbubble-outline"
                            size={22}
                            color={color}
                        />
                    ),
                }}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",

                    tabBarIcon: ({
                        color,
                    }) => (
                        <NotificationBadge
                            color={color}
                            count={
                                unreadCount
                            }
                            badgeColor="#ef4444"
                        />
                    ),
                }}
            />
        </Tabs>
    );
}

function NotificationBadge({
    color,
    count,
    badgeColor,
}: {
    color: string | import("react-native").ColorValue;
    count: number;
    badgeColor: string;
}) {
    return (
        <View
            style={{
                width: 30,
                height: 28,
                alignItems:
                    "center",
                justifyContent:
                    "center",
            }}
        >
            <Ionicons
                name="person-outline"
                size={23}
                color={color}
            />

            {count > 0 ? (
                <View
                    style={{
                        position:
                            "absolute",
                        top: -3,
                        right: -4,

                        minWidth: 16,
                        height: 16,

                        paddingHorizontal:
                            4,

                        borderRadius: 8,

                        backgroundColor:
                            badgeColor,

                        alignItems:
                            "center",
                        justifyContent:
                            "center",
                    }}
                >
                    <Text
                        style={{
                            color:
                                "#ffffff",
                            fontSize: 9,
                            fontWeight:
                                "800",
                        }}
                    >
                        {count > 99
                            ? "99+"
                            : count}
                    </Text>
                </View>
            ) : null}
        </View>
    );
}