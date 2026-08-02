"use client";

import {
    ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    align?: "left" | "right";
    width?: "sm" | "md" | "lg";
}

const widths = {
    sm: "w-56",
    md: "w-72",
    lg: "w-96",
};

export default function Dropdown({
    trigger,
    children,
    align = "right",
    width = "md",
}: DropdownProps) {
    const [open, setOpen] =
        useState(false);

    const ref =
        useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(
            e: MouseEvent
        ) {
            if (
                ref.current &&
                !ref.current.contains(
                    e.target as Node
                )
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

    return (
        <div
            ref={ref}
            className="relative"
        >
            <div
                onClick={() =>
                    setOpen((prev) => !prev)
                }
            >
                {trigger}
            </div>

            <AnimatePresence>

                {open && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 8,
                            scale: 0.98,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 8,
                            scale: 0.98,
                        }}
                        transition={{
                            duration: 0.18,
                        }}
                        className={clsx(
                            "absolute z-50 mt-3 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl",

                            widths[width],

                            align === "right"
                                ? "right-0"
                                : "left-0"
                        )}
                    >
                        {children}
                    </motion.div>
                )}

            </AnimatePresence>

        </div>
    );
}