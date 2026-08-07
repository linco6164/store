"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChevronDown } from "lucide-react";

interface Props {
    description: string;
}

export default function ProductDescription({
    description,
}: Props) {
    const [expanded, setExpanded] =
        useState(false);

    const shouldCollapse =
        description.length > 350;

    const text =
        expanded || !shouldCollapse
            ? description
            : `${description.slice(
                  0,
                  350
              )}...`;

    return (
        <section className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">

            <div className="mb-6 flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100">

                    <FileText
                        size={22}
                        className="text-emerald-600"
                    />

                </div>

                <div>

                    <h2 className="text-2xl font-bold">
                        Description
                    </h2>

                    <p className="text-sm text-gray-500">
                        Product details provided by the seller.
                    </p>

                </div>

            </div>

            <AnimatePresence mode="wait">

                <motion.div
                    key={expanded ? "full" : "short"}
                    initial={{
                        opacity: 0,
                        y: 6,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    exit={{
                        opacity: 0,
                        y: -6,
                    }}
                    transition={{
                        duration: 0.2,
                    }}
                >
                    <p className="whitespace-pre-wrap leading-8 text-gray-700">

                        {text}

                    </p>

                </motion.div>

            </AnimatePresence>

            {shouldCollapse && (

                <button
                    type="button"
                    onClick={() =>
                        setExpanded(
                            !expanded
                        )
                    }
                    className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-3 font-semibold transition hover:bg-gray-200"
                >

                    {expanded
                        ? "Show less"
                        : "Read more"}

                    <ChevronDown
                        size={18}
                        className={`transition-transform ${
                            expanded
                                ? "rotate-180"
                                : ""
                        }`}
                    />

                </button>

            )}

        </section>
    );
}