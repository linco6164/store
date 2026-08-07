"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

interface Props {
    open: boolean;
    title?: string;
    onClose: () => void;
    children: ReactNode;
}

export default function SearchDrawer({
    open,
    title = "Filters",
    onClose,
    children,
}: Props) {
    useEffect(() => {
        if (!open) return;

        const previousOverflow =
            document.body.style.overflow;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow =
                previousOverflow;
        };
    }, [open]);

    return (
        <AnimatePresence>

            {open && (

                <>
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
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{
                            y: "100%",
                        }}
                        animate={{
                            y: 0,
                        }}
                        exit={{
                            y: "100%",
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 280,
                            damping: 28,
                        }}
                        className="
                            fixed
                            bottom-0
                            left-0
                            right-0
                            z-[60]
                            max-h-[90vh]
                            overflow-y-auto
                            rounded-t-3xl
                            bg-white
                            shadow-2xl
                        "
                    >

                        <div className="sticky top-0 z-10 border-b bg-white">

                            <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-gray-300" />

                            <div className="flex items-center justify-between px-6 py-5">

                                <h2 className="text-xl font-bold">
                                    {title}
                                </h2>

                                <button
                                    onClick={onClose}
                                    className="
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-full
                                        transition
                                        hover:bg-gray-100
                                    "
                                >

                                    <X size={20} />

                                </button>

                            </div>

                        </div>

                        <div className="space-y-6 p-6">

                            {children}

                        </div>

                    </motion.div>
                </>

            )}

        </AnimatePresence>
    );
}