"use client";

import {
    forwardRef,
    TextareaHTMLAttributes,
    useEffect,
    useRef,
} from "react";

import clsx from "clsx";

interface TextareaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    helperText?: string;
    error?: string;
    autoResize?: boolean;
    showCount?: boolean;
}

const Textarea = forwardRef<
    HTMLTextAreaElement,
    TextareaProps
>(
    (
        {
            label,
            helperText,
            error,
            autoResize = true,
            showCount = false,
            className,
            maxLength,
            value,
            ...props
        },
        ref
    ) => {
        const innerRef =
            useRef<HTMLTextAreaElement>(null);

        const textareaRef =
            (ref as React.RefObject<HTMLTextAreaElement>) ??
            innerRef;

        useEffect(() => {
            if (
                !autoResize ||
                !textareaRef.current
            )
                return;

            textareaRef.current.style.height =
                "0px";

            textareaRef.current.style.height =
                `${textareaRef.current.scrollHeight}px`;
        }, [value, autoResize]);

        return (
            <div className="w-full">

                {label && (
                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                        {label}
                    </label>
                )}

                <textarea
                    ref={textareaRef}
                    value={value}
                    rows={4}
                    maxLength={maxLength}
                    className={clsx(
                        "min-h-[120px] w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-[15px] outline-none transition-all duration-200 placeholder:text-gray-400",

                        "focus:border-blue-500 focus:ring-4 focus:ring-blue-100",

                        error &&
                            "border-red-500 focus:border-red-500 focus:ring-red-100",

                        className
                    )}
                    {...props}
                />

                <div className="mt-2 flex items-center justify-between">

                    <div>
                        {error ? (
                            <p className="text-sm text-red-500">
                                {error}
                            </p>
                        ) : helperText ? (
                            <p className="text-sm text-gray-500">
                                {helperText}
                            </p>
                        ) : null}
                    </div>

                    {showCount &&
                        maxLength && (
                            <span className="text-xs text-gray-400">
                                {String(value ?? "")
                                    .length}
                                /{maxLength}
                            </span>
                        )}

                </div>

            </div>
        );
    }
);

Textarea.displayName = "Textarea";

export default Textarea;