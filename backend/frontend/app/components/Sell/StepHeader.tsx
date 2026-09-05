"use client";

import { motion } from "framer-motion";
import { PackagePlus } from "lucide-react";

interface StepHeaderProps {
    title?: string;
    description?: string;
}

export default function StepHeader({
    title = "Create your listing",
    description = "Fill in the details below to publish your product on Nexora.",
}: StepHeaderProps) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: 20,
            }}
            animate={{
                opacity: 1,
                y: 0,
            }}
            transition={{
                duration: 0.35,
            }}
            className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-8 lg:p-8"
        >
            <div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-emerald-200/30 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-start gap-5">

                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
                        <PackagePlus size={30} />
                    </div>

                    <div>

                        <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Seller Dashboard
                        </span>

                        <h1 className="mt-3 text-3xl font-black text-gray-900 lg:text-3xl">
                            {title}
                        </h1>

                        <p className="mt-3 max-w-2xl text-gray-600">
                            {description}
                        </p>

                    </div>

                </div>

                <div className="grid grid-cols-3 gap-4">

                    <Stat
                        value="2 min"
                        label="Average"
                    />

                    <Stat
                        value="6"
                        label="Steps"
                    />

                    <Stat
                        value="Free"
                        label="Publishing"
                    />

                </div>

            </div>
        </motion.div>
    );
}

interface StatProps {
    value: string;
    label: string;
}

function Stat({
    value,
    label,
}: StatProps) {
    return (
        <div className="rounded-2xl border border-white/70 bg-white/70 p-3 text-center backdrop-blur">

            <div className="text-lg font-bold text-gray-900">
                {value}
            </div>

            <div className="mt-1 text-xs text-gray-500">
                {label}
            </div>

        </div>
    );
}