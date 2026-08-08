"use client";

import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    AnimatePresence,
    motion,
} from "framer-motion";

import {
    LoaderCircle,
} from "lucide-react";

import {
    usePathname,
    useSearchParams,
} from "next/navigation";

export default function NavigationLoading() {
    const pathname =
        usePathname();

    const searchParams =
        useSearchParams();

    const [loading, setLoading] =
        useState(false);

    const previousUrl =
        useRef<string | null>(null);

    const navigationStarted =
        useRef(false);

    /*
     * URL-ul curent.
     */
    const currentUrl =
        `${pathname}?${searchParams.toString()}`;

    /*
     * Oprim loader-ul când Next.js
     * a terminat navigarea.
     */
    useEffect(() => {
        if (
            navigationStarted.current
        ) {
            navigationStarted.current =
                false;

            setLoading(false);
        }

        previousUrl.current =
            currentUrl;
    }, [currentUrl]);

    useEffect(() => {
        /*
         * Click pe Link intern.
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

            /*
             * Nu interceptăm linkurile externe.
             */
            if (
                url.origin !==
                window.location.origin
            ) {
                return;
            }

            /*
             * Dacă este aceeași pagină,
             * nu afișăm loader.
             */
            if (
                url.pathname ===
                    window.location.pathname &&
                url.search ===
                    window.location.search
            ) {
                return;
            }

            navigationStarted.current =
                true;

            setLoading(true);
        };

        /*
         * Back / Forward.
         */
        const handlePopState = () => {
            navigationStarted.current =
                true;

            setLoading(true);
        };

        /*
         * Router.push / replaceState.
         *
         * Nu interceptăm navigarea în sine,
         * ci lăsăm usePathname() să oprească
         * loader-ul când URL-ul s-a schimbat.
         */
        const originalPushState =
            window.history.pushState;

        const originalReplaceState =
            window.history.replaceState;

        window.history.pushState =
            function (
                ...args
            ) {
                navigationStarted.current =
                    true;

                setLoading(true);

                return originalPushState.apply(
                    window.history,
                    args
                );
            };

        window.history.replaceState =
            function (
                ...args
            ) {
                navigationStarted.current =
                    true;

                setLoading(true);

                return originalReplaceState.apply(
                    window.history,
                    args
                );
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

        return () => {
            document.removeEventListener(
                "click",
                handleClick,
                true
            );

            window.removeEventListener(
                "popstate",
                handlePopState
            );

            window.history.pushState =
                originalPushState;

            window.history.replaceState =
                originalReplaceState;
        };
    }, []);

    /*
     * Back/Forward + bfcache.
     */
    useEffect(() => {
        const handlePageShow = (
            event: PageTransitionEvent
        ) => {
            if (event.persisted) {
                navigationStarted.current =
                    false;

                setLoading(false);
            }
        };

        window.addEventListener(
            "pageshow",
            handlePageShow
        );

        return () => {
            window.removeEventListener(
                "pageshow",
                handlePageShow
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
                        duration: 0.15,
                    }}
                    /*
                     * ACUM BLOCHĂM INTERACȚIUNEA
                     * cât timp se face navigarea.
                     */
                    className="fixed inset-0 z-[9999] flex cursor-wait items-start justify-center bg-white/45 pt-20 backdrop-blur-[2px]"
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
                        transition={{
                            duration: 0.16,
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