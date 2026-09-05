"use client";

import {
    forwardRef,
    InputHTMLAttributes,
    ReactNode,
    useState,
} from "react";

import clsx from "clsx";
import {
    Search,
    X,
} from "lucide-react";

interface SearchInputProps
    extends InputHTMLAttributes<HTMLInputElement> {
    loading?: boolean;
    leftIcon?: ReactNode;
}

const SearchInput = forwardRef<
    HTMLInputElement,
    SearchInputProps
>(
    (
        {
            value,
            onChange,
            loading = false,
            placeholder = "Search...",
            className,
            leftIcon,
            ...props
        },
        ref
    ) => {
        const [focused, setFocused] =
            useState(false);

        return (
            <div
                className={clsx(
                    "relative flex h-12 w-full items-center rounded-2xl border bg-white transition-all duration-200",

                    focused
                        ? "border-blue-500 shadow-lg shadow-blue-100"
                        : "border-gray-200 hover:border-gray-300"
                )}
            >
                <div className="pl-4 text-gray-400">
                    {leftIcon ?? (
                        <Search size={20} />
                    )}
                </div>

                <input
                    ref={ref}
                    value={value}
                    onChange={onChange}
                    onFocus={() =>
                        setFocused(true)
                    }
                    onBlur={() =>
                        setFocused(false)
                    }
                    placeholder={placeholder}
                    className={clsx(
                        "h-full w-full bg-transparent px-3 text-[15px] outline-none placeholder:text-gray-400",
                        className
                    )}
                    {...props}
                />

                {loading && (
                    <div className="mr-4 h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                )}

                {!!value && !loading && (
                    <button
                        type="button"
                        onClick={() => {
                            if (onChange) {
                                onChange({
                                    target: {
                                        value: "",
                                    },
                                } as React.ChangeEvent<HTMLInputElement>);
                            }
                        }}
                        className="mr-3 rounded-full p-1 transition hover:bg-gray-100"
                    >
                        <X size={16} />
                    </button>
                )}
            </div>
        );
    }
);

SearchInput.displayName =
    "SearchInput";

export default SearchInput;