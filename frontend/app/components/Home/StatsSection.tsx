"use client";

import { motion } from "framer-motion";
import {
    Package,
    Users,
    ShieldCheck,
    Star,
} from "lucide-react";

import { Container } from "../layout";

const stats = [
    {
        icon: Package,
        value: "120K+",
        label: "Active Listings",
        color: "text-emerald-600",
        bg: "bg-emerald-100",
    },
    {
        icon: Users,
        value: "35K+",
        label: "Verified Users",
        color: "text-blue-600",
        bg: "bg-blue-100",
    },
    {
        icon: Star,
        value: "99.8%",
        label: "Positive Reviews",
        color: "text-amber-500",
        bg: "bg-amber-100",
    },
    {
        icon: ShieldCheck,
        value: "24/7",
        label: "Secure Platform",
        color: "text-violet-600",
        bg: "bg-violet-100",
    },
];

export default function StatsSection() {
    return (
        <section className="py-20 bg-white">

            <Container>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                    {stats.map((stat, index) => {
                        const Icon = stat.icon;

                        return (
                            <motion.div
                                key={stat.label}
                                initial={{
                                    opacity: 0,
                                    y: 25,
                                }}
                                whileInView={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                viewport={{
                                    once: true,
                                }}
                                transition={{
                                    duration: 0.4,
                                    delay: index * 0.08,
                                }}
                                className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                            >
                                <div
                                    className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${stat.bg}`}
                                >
                                    <Icon
                                        size={32}
                                        className={stat.color}
                                    />
                                </div>

                                <h3 className="text-4xl font-black tracking-tight text-gray-900">
                                    {stat.value}
                                </h3>

                                <p className="mt-2 text-gray-500">
                                    {stat.label}
                                </p>

                            </motion.div>
                        );
                    })}

                </div>

            </Container>

        </section>
    );
}