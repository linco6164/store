"use client";

import clsx from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant =
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger";

type Size =
    | "sm"
    | "md"
    | "lg";

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    loading?: boolean;
    fullWidth?: boolean;
}

const Button = forwardRef<
    HTMLButtonElement,
    ButtonProps
>(
    (
        {
            children,
            className,
            variant = "primary",
            size = "md",
            loading = false,
            fullWidth = false,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={clsx(
                    "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:pointer-events-none disabled:opacity-50",

                    fullWidth && "w-full",

                    {
                        "bg-blue-600 text-white hover:bg-blue-700 shadow-sm":
                            variant === "primary",

                        "bg-gray-100 text-gray-900 hover:bg-gray-200":
                            variant === "secondary",

                        "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50":
                            variant === "outline",

                        "text-gray-700 hover:bg-gray-100":
                            variant === "ghost",

                        "bg-red-600 text-white hover:bg-red-700":
                            variant === "danger",
                    },

                    {
                        "h-9 px-3 text-sm":
                            size === "sm",

                        "h-11 px-5":
                            size === "md",

                        "h-12 px-6 text-base":
                            size === "lg",
                    },

                    className
                )}
                {...props}
            >
                {loading && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}

                {children}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;