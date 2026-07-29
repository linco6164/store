"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ReactNode, useEffect, useRef, useState } from "react";

interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    width?: string;
}

export default function Dropdown({
    trigger,
    children,
    width = "w-80",
}: DropdownProps) {
    const [open, setOpen] = useState(false);

    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                ref.current &&
                !ref.current.contains(event.target as Node)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () =>
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
    }, []);

    return (
        <div
            ref={ref}
            className="relative"
        >
            <button
                onClick={() => setOpen(!open)}
            >
                {trigger}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 10,
                            scale: 0.98,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: 10,
                            scale: 0.98,
                        }}
                        transition={{
                            duration: 0.18,
                        }}
                        className={`
                            absolute
                            right-0
                            mt-3
                            ${width}
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            shadow-xl
                            overflow-hidden
                            z-50
                        `}
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}