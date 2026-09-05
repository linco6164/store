"use client";

import {
    forwardRef,
    InputHTMLAttributes,
    ReactNode,
    useState,
} from "react";

import clsx from "clsx";
import {
    Eye,
    EyeOff,
    AlertCircle,
} from "lucide-react";

interface InputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

const Input = forwardRef<
    HTMLInputElement,
    InputProps
>(
    (
        {
            label,
            error,
            leftIcon,
            rightIcon,
            className,
            type,
            ...props
        },
        ref
    ) => {
        const [showPassword, setShowPassword] =
            useState(false);

        const isPassword =
            type === "password";

        return (
            <div className="w-full">

                {label && (
                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                        {label}
                    </label>
                )}

                <div
                    className={clsx(
                        "group flex h-12 items-center rounded-xl border bg-white transition-all duration-200",

                        error
                            ? "border-red-500 ring-2 ring-red-100"
                            : "border-gray-200 hover:border-gray-300 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100"
                    )}
                >
                    {leftIcon && (
                        <div className="pl-4 text-gray-400">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        type={
                            isPassword
                                ? showPassword
                                    ? "text"
                                    : "password"
                                : type
                        }
                        className={clsx(
                            "h-full flex-1 bg-transparent px-4 text-[15px] outline-none placeholder:text-gray-400",
                            className
                        )}
                        {...props}
                    />

                    {isPassword ? (
                        <button
                            type="button"
                            onClick={() =>
                                setShowPassword(
                                    (prev) => !prev
                                )
                            }
                            className="px-4 text-gray-400 transition hover:text-gray-600"
                        >
                            {showPassword ? (
                                <EyeOff size={20} />
                            ) : (
                                <Eye size={20} />
                            )}
                        </button>
                    ) : (
                        rightIcon && (
                            <div className="pr-4 text-gray-400">
                                {rightIcon}
                            </div>
                        )
                    )}
                </div>

                {error && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;