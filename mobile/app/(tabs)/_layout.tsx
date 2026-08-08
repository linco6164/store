import { Tabs } from "expo-router";

import { HapticTab } from "@/components/haptic-tab";

import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "@/theme";

export default function TabLayout() {
    const { theme } = useTheme();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,

                tabBarActiveTintColor:
                    theme.colors.primary,

                tabBarInactiveTintColor:
                    theme.colors.textMuted,

                tabBarButton:
                    HapticTab,

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
                        <Ionicons
                            name="person-outline"
                            size={23}
                            color={color}
                        />
                    ),
                }}
            />
        </Tabs>
    );
}