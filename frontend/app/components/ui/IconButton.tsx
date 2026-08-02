"use client";

import clsx from "clsx";
import {
    ButtonHTMLAttributes,
    forwardRef,
    ReactNode,
} from "react";

export type IconButtonVariant =
    | "default"
    | "primary"
    | "danger"
    | "ghost"
    | "outline";

export type IconButtonSize =
    | "sm"
    | "md"
    | "lg";

interface IconButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    icon: ReactNode;
    badge?: number;
    variant?: IconButtonVariant;
    size?: IconButtonSize;
    rounded?: boolean;
}

const IconButton = forwardRef<
    HTMLButtonElement,
    IconButtonProps
>(
    (
        {
            icon,
            badge,
            variant = "default",
            size = "md",
            rounded = true,
            className,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                className={clsx(
                    "relative flex items-center justify-center transition-all duration-200 active:scale-95",

                    rounded
                        ? "rounded-full"
                        : "rounded-xl",

                    {
                        "border border-gray-200 bg-white hover:bg-gray-50":
                            variant ===
                            "default",

                        "bg-blue-600 text-white hover:bg-blue-700":
                            variant ===
                            "primary",

                        "bg-red-600 text-white hover:bg-red-700":
                            variant ===
                            "danger",

                        "hover:bg-gray-100":
                            variant ===
                            "ghost",

                        "border border-gray-200 bg-transparent hover:bg-gray-100":
                            variant ===
                            "outline",
                    },

                    {
                        "h-9 w-9":
                            size === "sm",

                        "h-11 w-11":
                            size === "md",

                        "h-12 w-12":
                            size === "lg",
                    },

                    className
                )}
                {...props}
            >
                {icon}

                {!!badge && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow">
                        {badge > 99
                            ? "99+"
                            : badge}
                    </span>
                )}
            </button>
        );
    }
);

IconButton.displayName =
    "IconButton";

export default IconButton;