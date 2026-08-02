"use client";

import clsx from "clsx";

interface SwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    description?: string;
}

export default function Switch({
    checked,
    onChange,
    disabled = false,
    label,
    description,
}: SwitchProps) {
    return (
        <label
            className={clsx(
                "flex items-center justify-between gap-4",
                disabled && "cursor-not-allowed opacity-60",
                !disabled && "cursor-pointer"
            )}
        >
            <div className="flex-1">

                {label && (
                    <p className="font-medium text-gray-900">
                        {label}
                    </p>
                )}

                {description && (
                    <p className="mt-1 text-sm text-gray-500">
                        {description}
                    </p>
                )}

            </div>

            <button
                type="button"
                disabled={disabled}
                onClick={() =>
                    !disabled &&
                    onChange(!checked)
                }
                className={clsx(
                    "relative h-7 w-12 rounded-full transition-all duration-300",

                    checked
                        ? "bg-blue-600"
                        : "bg-gray-300"
                )}
            >
                <span
                    className={clsx(
                        "absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-300",

                        checked
                            ? "left-6"
                            : "left-1"
                    )}
                />
            </button>
        </label>
    );
}