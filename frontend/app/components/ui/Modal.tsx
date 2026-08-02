"use client";

import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import clsx from "clsx";

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl";
    closeOnOverlay?: boolean;
}

const sizes = {
    sm: "max-w-sm",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
};

export default function Modal({
    open,
    onClose,
    title,
    children,
    size = "md",
    closeOnOverlay = true,
}: ModalProps) {
    useEffect(() => {
        if (!open) return;

        const handleEscape = (
            e: KeyboardEvent
        ) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.body.style.overflow = "hidden";

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
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    onClick={() => {
                        if (
                            closeOnOverlay
                        ) {
                            onClose();
                        }
                    }}
                >
                    <motion.div
                        initial={{
                            opacity: 0,
                            scale: 0.95,
                            y: 20,
                        }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            y: 0,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0.95,
                            y: 20,
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                        className={clsx(
                            "w-full rounded-3xl bg-white shadow-2xl",
                            sizes[size]
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

                        <div className="p-6">
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}