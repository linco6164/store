"use client";

import {
    ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

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
    const [open, setOpen] = useState(false);

    const ref =
        useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(
            event: MouseEvent
        ) {
            if (
                ref.current &&
                !ref.current.contains(
                    event.target as Node
                )
            ) {
                setOpen(false);
            }
        }

        function handleEscape(
            event: KeyboardEvent
        ) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        document.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

            document.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, []);

    return (
        <div
            ref={ref}
            className="relative"
        >
            <div
                onClick={() =>
                    setOpen(
                        (previous) => !previous
                    )
                }
                aria-expanded={open}
            >
                {trigger}
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: -6,
                            scale: 0.97,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: -4,
                            scale: 0.98,
                        }}
                        transition={{
                            duration: 0.16,
                            ease: [
                                0.22,
                                1,
                                0.36,
                                1,
                            ],
                        }}
                        className={clsx(
                            "absolute top-full z-[100] mt-3 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)]",
                            "backdrop-blur-xl",
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