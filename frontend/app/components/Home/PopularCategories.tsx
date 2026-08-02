"use client";

import Link from "next/link";
import {
    Smartphone,
    Shirt,
    Car,
    Home,
    Laptop,
    Gamepad2,
    Baby,
    Dumbbell,
    ArrowRight,
} from "lucide-react";

import { motion } from "framer-motion";

import { Container } from "../layout";

const categories = [
    {
        name: "Electronics",
        icon: Smartphone,
        href: "/category/electronics",
        listings: "4,250",
        color: "from-blue-500 to-cyan-500",
    },
    {
        name: "Fashion",
        icon: Shirt,
        href: "/category/fashion",
        listings: "8,420",
        color: "from-pink-500 to-rose-500",
    },
    {
        name: "Auto",
        icon: Car,
        href: "/category/auto",
        listings: "2,145",
        color: "from-orange-500 to-red-500",
    },
    {
        name: "Home",
        icon: Home,
        href: "/category/home",
        listings: "1,980",
        color: "from-emerald-500 to-green-500",
    },
    {
        name: "Computers",
        icon: Laptop,
        href: "/category/computers",
        listings: "2,910",
        color: "from-indigo-500 to-blue-600",
    },
    {
        name: "Gaming",
        icon: Gamepad2,
        href: "/category/gaming",
        listings: "1,250",
        color: "from-violet-500 to-purple-600",
    },
    {
        name: "Kids",
        icon: Baby,
        href: "/category/kids",
        listings: "980",
        color: "from-teal-500 to-emerald-600",
    },
    {
        name: "Sports",
        icon: Dumbbell,
        href: "/category/sports",
        listings: "760",
        color: "from-red-500 to-orange-500",
    },
];

export default function PopularCategories() {
    return (
        <section className="py-20">

            <Container>

                <div className="mb-10 flex items-center justify-between">

                    <div>

                        <h2 className="text-3xl font-bold">
                            Popular Categories
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Discover the most active categories on Nexora.
                        </p>

                    </div>

                    <Link
                        href="/categories"
                        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold transition hover:bg-gray-50"
                    >
                        View all

                        <ArrowRight size={18} />

                    </Link>

                </div>

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                    {categories.map(
                        (
                            category,
                            index
                        ) => {
                            const Icon =
                                category.icon;

                            return (
                                <motion.div
                                    key={
                                        category.name
                                    }
                                    initial={{
                                        opacity: 0,
                                        y: 20,
                                    }}
                                    whileInView={{
                                        opacity: 1,
                                        y: 0,
                                    }}
                                    viewport={{
                                        once: true,
                                    }}
                                    transition={{
                                        delay:
                                            index *
                                            0.05,
                                    }}
                                >
                                    <Link
                                        href={
                                            category.href
                                        }
                                        className="group block overflow-hidden rounded-3xl border border-gray-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
                                    >
                                        <div
                                            className={`bg-gradient-to-r ${category.color} p-6 text-white`}
                                        >
                                            <Icon
                                                size={36}
                                            />
                                        </div>

                                        <div className="p-6">

                                            <h3 className="text-lg font-bold transition group-hover:text-emerald-600">
                                                {
                                                    category.name
                                                }
                                            </h3>

                                            <p className="mt-2 text-sm text-gray-500">
                                                {
                                                    category.listings
                                                }{" "}
                                                listings
                                            </p>

                                        </div>

                                    </Link>
                                </motion.div>
                            );
                        }
                    )}

                </div>

            </Container>

        </section>
    );
}