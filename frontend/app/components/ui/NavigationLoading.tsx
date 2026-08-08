"use client";

import {
    useEffect,
    useState,
} from "react";

import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle } from "lucide-react";

export default function NavigationLoading() {
    const [loading, setLoading] =
        useState(false);

    useEffect(() => {
        let navigationTimer: number | undefined;

        const startLoading = () => {
            window.clearTimeout(
                navigationTimer
            );

            setLoading(true);
        };

        const stopLoading = () => {
            window.clearTimeout(
                navigationTimer
            );

            navigationTimer = window.setTimeout(
                () => {
                    setLoading(false);
                },
                120
            );
        };

        /*
         * Intercept internal links.
         */

        const handleClick = (
            event: MouseEvent
        ) => {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }

            const target =
                event.target as HTMLElement;

            const link =
                target.closest("a");

            if (!link) {
                return;
            }

            const href =
                link.getAttribute("href");

            if (
                !href ||
                href.startsWith("#") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:") ||
                link.target === "_blank" ||
                link.hasAttribute("download")
            ) {
                return;
            }

            const url = new URL(
                link.href,
                window.location.href
            );

            if (
                url.origin !==
                window.location.origin
            ) {
                return;
            }

            if (
                url.pathname ===
                    window.location.pathname &&
                url.search ===
                    window.location.search
            ) {
                return;
            }

            startLoading();
        };

        /*
         * Browser Back / Forward.
         */

        const handlePopState = () => {
            startLoading();
        };

        /*
         * When the page is restored from bfcache.
         */

        const handlePageShow = (
            event: PageTransitionEvent
        ) => {
            if (event.persisted) {
                startLoading();

                requestAnimationFrame(() => {
                    stopLoading();
                });
            }
        };

        /*
         * When leaving the document.
         */

        const handlePageHide = () => {
            startLoading();
        };

        document.addEventListener(
            "click",
            handleClick,
            true
        );

        window.addEventListener(
            "popstate",
            handlePopState
        );

        window.addEventListener(
            "pageshow",
            handlePageShow
        );

        window.addEventListener(
            "pagehide",
            handlePageHide
        );

        return () => {
            window.clearTimeout(
                navigationTimer
            );

            document.removeEventListener(
                "click",
                handleClick,
                true
            );

            window.removeEventListener(
                "popstate",
                handlePopState
            );

            window.removeEventListener(
                "pageshow",
                handlePageShow
            );

            window.removeEventListener(
                "pagehide",
                handlePageHide
            );
        };
    }, []);

    return (
        <AnimatePresence>
            {loading && (
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
                    transition={{
                        duration: 0.16,
                    }}
                    className="pointer-events-none fixed inset-0 z-[9999] flex items-start justify-center bg-white/35 pt-20 backdrop-blur-[2px]"
                >
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: -8,
                            scale: 0.96,
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            y: -8,
                            scale: 0.96,
                        }}
                        className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-xl"
                    >
                        <LoaderCircle
                            size={20}
                            strokeWidth={2}
                            className="animate-spin text-gray-900"
                        />

                        <span className="text-sm font-semibold text-gray-700">
                            Se încarcă...
                        </span>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}