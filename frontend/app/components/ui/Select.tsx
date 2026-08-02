"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    label?: string;
    placeholder?: string;
    value?: string;
    options: SelectOption[];
    error?: string;
    disabled?: boolean;
    onChange: (value: string) => void;
}

export default function Select({
    label,
    placeholder = "Selectează...",
    value,
    options,
    error,
    disabled,
    onChange,
}: SelectProps) {
    const [open, setOpen] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (
                ref.current &&
                !ref.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClick
        );

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClick
            );
    }, []);

    const selected = options.find(
        (option) => option.value === value
    );

    return (
        <div
            ref={ref}
            className="relative w-full"
        >
            {label && (
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                    {label}
                </label>
            )}

            <button
                type="button"
                disabled={disabled}
                onClick={() =>
                    setOpen((prev) => !prev)
                }
                className={clsx(
                    "flex h-12 w-full items-center justify-between rounded-xl border bg-white px-4 text-left transition",

                    error
                        ? "border-red-500"
                        : "border-gray-200 hover:border-gray-300 focus:border-blue-500",

                    disabled &&
                        "cursor-not-allowed opacity-60"
                )}
            >
                <span
                    className={clsx(
                        selected
                            ? "text-gray-900"
                            : "text-gray-400"
                    )}
                >
                    {selected?.label ??
                        placeholder}
                </span>

                <ChevronDown
                    size={18}
                    className={clsx(
                        "transition",
                        open &&
                            "rotate-180"
                    )}
                />
            </button>

            {open && (
                <div className="absolute z-50 mt-2 max-h-72 w-full overflow-auto rounded-xl border border-gray-200 bg-white py-2 shadow-xl">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(
                                    option.value
                                );
                                setOpen(false);
                            }}
                            className="flex w-full items-center justify-between px-4 py-3 text-left transition hover:bg-gray-50"
                        >
                            <span>
                                {option.label}
                            </span>

                            {value ===
                                option.value && (
                                <Check
                                    size={18}
                                    className="text-blue-600"
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}

            {error && (
                <p className="mt-2 text-sm text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}