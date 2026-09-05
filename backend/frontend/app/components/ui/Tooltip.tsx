"use client";

import {
    ReactNode,
    useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";

interface TooltipProps {
    children: ReactNode;
    content: ReactNode;
    position?: "top" | "bottom" | "left" | "right";
}

const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export default function Tooltip({
    children,
    content,
    position = "top",
}: TooltipProps) {
    const [open, setOpen] =
        useState(false);

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() =>
                setOpen(true)
            }
            onMouseLeave={() =>
                setOpen(false)
            }
        >
            {children}

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 4,
                            scale: 0.96,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 4,
                            scale: 0.96,
                        }}
                        transition={{
                            duration: 0.15,
                        }}
                        className={clsx(
                            "absolute z-50 whitespace-nowrap rounded-xl bg-gray-900 px-3 py-2 text-xs font-medium text-white shadow-xl",
                            positions[position]
                        )}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}