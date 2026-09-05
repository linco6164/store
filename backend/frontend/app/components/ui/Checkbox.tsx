"use client";

import clsx from "clsx";
import { Check } from "lucide-react";

interface CheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label?: string;
    description?: string;
}

export default function Checkbox({
    checked,
    onChange,
    disabled = false,
    label,
    description,
}: CheckboxProps) {
    return (
        <label
            className={clsx(
                "flex cursor-pointer items-start gap-3",
                disabled && "cursor-not-allowed opacity-60"
            )}
        >
            <button
                type="button"
                disabled={disabled}
                onClick={() =>
                    !disabled &&
                    onChange(!checked)
                }
                className={clsx(
                    "mt-0.5 flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-200",

                    checked
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white hover:border-blue-500"
                )}
            >
                <Check
                    size={14}
                    className={clsx(
                        "transition-all duration-200",
                        checked
                            ? "scale-100 opacity-100"
                            : "scale-50 opacity-0"
                    )}
                />
            </button>

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
        </label>
    );
}