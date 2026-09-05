"use client";

import Image from "next/image";
import { Trash2, Star } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
    file: File;
    index: number;
    isCover?: boolean;
    onDelete: () => void;
}

export default function ImagePreview({
    file,
    isCover = false,
    onDelete,
}: Props) {
    return (
        <motion.div
            layout
            initial={{
                opacity: 0,
                scale: .9,
            }}
            animate={{
                opacity: 1,
                scale: 1,
            }}
            exit={{
                opacity: 0,
                scale: .9,
            }}
            className="group relative overflow-hidden rounded-2xl"
        >
            <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                width={500}
                height={500}
                className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
            />

            {isCover && (

                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow">

                    <Star size={12} />

                    Cover

                </div>

            )}

            <button
                type="button"
                onClick={onDelete}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow transition hover:bg-red-500 hover:text-white"
            >
                <Trash2 size={18} />
            </button>

        </motion.div>
    );
}