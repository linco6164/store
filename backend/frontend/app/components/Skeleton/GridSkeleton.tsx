"use client";

import { motion } from "framer-motion";

import ListingCardSkeleton from "./ListingCardSkeleton";

interface GridSkeletonProps {
    count?: number;
}

export default function GridSkeleton({
    count = 8,
}: GridSkeletonProps) {
    return (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">

            {Array.from({ length: count }).map((_, index) => (

                <motion.div
                    key={index}
                    initial={{
                        opacity: 0,
                        y: 12,
                    }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: index * 0.03,
                    }}
                >
                    <ListingCardSkeleton />
                </motion.div>

            ))}

        </div>
    );
}