"use client";

import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { X } from "lucide-react";

interface DrawerProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    side?: "left" | "right" | "bottom";
    size?: "sm" | "md" | "lg";
}

const widths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-xl",
};

export default function Drawer({
    open,
    onClose,
    title,
    children,
    side = "right",
    size = "md",
}: DrawerProps) {
    useEffect(() => {
        if (!open) return;

        document.body.style.overflow = "hidden";

        const handleEscape = (
            e: KeyboardEvent
        ) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener(
            "keydown",
            handleEscape
        );

        return () => {
            document.body.style.overflow = "";

            window.removeEventListener(
                "keydown",
                handleEscape
            );
        };
    }, [open, onClose]);

    const variants = {
        right: {
            initial: {
                x: "100%",
            },
            animate: {
                x: 0,
            },
            exit: {
                x: "100%",
            },
            className: `right-0 top-0 h-full ${widths[size]}`,
        },

        left: {
            initial: {
                x: "-100%",
            },
            animate: {
                x: 0,
            },
            exit: {
                x: "-100%",
            },
            className: `left-0 top-0 h-full ${widths[size]}`,
        },

        bottom: {
            initial: {
                y: "100%",
            },
            animate: {
                y: 0,
            },
            exit: {
                y: "100%",
            },
            className:
                "bottom-0 left-0 h-auto w-full rounded-t-3xl",
        },
    };

    const current =
        variants[side];

    return (
        <AnimatePresence>

            {open && (
                <motion.div
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    exit={{
                        opacity: 0,
                    }}
                    className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={
                            current.initial
                        }
                        animate={
                            current.animate
                        }
                        exit={current.exit}
                        transition={{
                            type: "spring",
                            damping: 28,
                            stiffness: 260,
                        }}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className={clsx(
                            "absolute flex flex-col bg-white shadow-2xl",
                            current.className
                        )}
                    >
                        <div className="flex items-center justify-between border-b px-6 py-5">

                            <h2 className="text-xl font-semibold">
                                {title}
                            </h2>

                            <button
                                onClick={onClose}
                                className="rounded-xl p-2 transition hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>

                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {children}
                        </div>

                    </motion.div>
                </motion.div>
            )}

        </AnimatePresence>
    );
}