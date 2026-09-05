"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
    images: string[];
    title: string;
}

export default function ProductGallery({
    images,
    title,
}: Props) {
    const [selected, setSelected] = useState(0);

    const gallery =
        images.length > 0
            ? images
            : ["/images/placeholder.png"];

    return (
        <div className="space-y-5">

            {/* Main image */}

            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">

                <div className="relative aspect-[4/3]">

                    <AnimatePresence mode="wait">

                        <motion.div
                            key={selected}
                            initial={{
                                opacity: 0,
                                scale: .96,
                            }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                            }}
                            exit={{
                                opacity: 0,
                                scale: .98,
                            }}
                            transition={{
                                duration: .25,
                            }}
                            className="absolute inset-0"
                        >

                            <Image
                                src={gallery[selected]}
                                alt={title}
                                fill
                                priority
                                className="
                                    object-cover
                                    transition-transform
                                    duration-500
                                    hover:scale-110
                                "
                            />

                        </motion.div>

                    </AnimatePresence>

                </div>

            </div>

            {/* Thumbnails */}

            <div className="grid grid-cols-5 gap-3">

                {gallery.map((image, index) => (

                    <button
                        key={index}
                        type="button"
                        onClick={() =>
                            setSelected(index)
                        }
                        className={`
                            relative
                            aspect-square
                            overflow-hidden
                            rounded-2xl
                            border-2
                            transition-all
                            ${
                                selected === index
                                    ? "border-emerald-500"
                                    : "border-transparent hover:border-gray-300"
                            }
                        `}
                    >

                        <Image
                            src={image}
                            alt=""
                            fill
                            className="object-cover"
                        />

                    </button>

                ))}

            </div>

        </div>
    );
}