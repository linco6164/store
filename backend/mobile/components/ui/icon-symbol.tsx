import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { SymbolWeight } from "expo-symbols";
import type { ComponentProps } from "react";
import {
    OpaqueColorValue,
    type StyleProp,
    type TextStyle,
} from "react-native";

const MAPPING = {
    "house.fill": "home",
    "paperplane.fill": "send",
    "chevron.left.forwardslash.chevron.right":
        "code",
    "chevron.right": "chevron-right",
} as const;

type IconSymbolName =
    keyof typeof MAPPING;

type MaterialIconName =
    ComponentProps<
        typeof MaterialIcons
    >["name"];

export function IconSymbol({
    name,
    size = 24,
    color,
    style,
}: {
    name: IconSymbolName;
    size?: number;
    color: string | OpaqueColorValue;
    style?: StyleProp<TextStyle>;
    weight?: SymbolWeight;
}) {
    const iconName =
        MAPPING[name] as MaterialIconName;

    return (
        <MaterialIcons
            color={color}
            size={size}
            name={iconName}
            style={style}
        />
    );
}