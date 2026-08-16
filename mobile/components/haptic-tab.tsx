import { Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import type { ComponentProps } from "react";

type HapticTabProps = ComponentProps<typeof Pressable>;

export function HapticTab(
    props: HapticTabProps
) {
    return (
        <Pressable
            {...props}
            onPressIn={(event) => {
                if (process.env.EXPO_OS === "ios") {
                    Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light
                    );
                }

                props.onPressIn?.(event);
            }}
        />
    );
}