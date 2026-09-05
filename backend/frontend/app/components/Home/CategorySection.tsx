"use client";

import Link from "next/link";
import {
    Smartphone,
    Shirt,
    Sofa,
    Car,
    Laptop,
    Gamepad2,
    Baby,
    Dumbbell,
} from "lucide-react";

import { motion } from "framer-motion";
import { Container } from "../layout";

const categories = [
    {
        name: "Electronics",
        href: "/category/electronics",
        icon: Smartphone,
        color: "bg-blue-100 text-blue-600",
    },
    {
        name: "Fashion",
        href: "/category/fashion",
        icon: Shirt,
        color: "bg-pink-100 text-pink-600",
    },
    {
        name: "Home",
        href: "/category/home",
        icon: Sofa,
        color: "bg-amber-100 text-amber-600",
    },
    {
        name: "Auto",
        href: "/category/auto",
        icon: Car,
        color: "bg-gray-100 text-gray-700",
    },
    {
        name: "Computers",
        href: "/category/computers",
        icon: Laptop,
        color: "bg-indigo-100 text-indigo-600",
    },
    {
        name: "Gaming",
        href: "/category/gaming",
        icon: Gamepad2,
        color: "bg-violet-100 text-violet-600",
    },
    {
        name: "Kids",
        href: "/category/kids",
        icon: Baby,
        color: "bg-emerald-100 text-emerald-600",
    },
    {
        name: "Sports",
        href: "/category/sports",
        icon: Dumbbell,
        color: "bg-red-100 text-red-600",
    },
];

export default function CategorySection() {
    return (
        <section className="py-16">
            <Container>

                <div className="mb-10 flex items-end justify-between">

                    <div>
                        <h2 className="text-3xl font-bold">
                            Browse Categories
                        </h2>

                        <p className="mt-2 text-gray-500">
                            Explore thousands of products by category.
                        </p>
                    </div>

                </div>

                <div className="grid grid-cols-2 gap-5 md:grid-cols-4 xl:grid-cols-8">

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
                                        className="group flex flex-col items-center rounded-3xl border border-gray-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
                                    >
                                        <div
                                            className={`flex h-16 w-16 items-center justify-center rounded-2xl ${category.color}`}
                                        >
                                            <Icon
                                                size={
                                                    30
                                                }
                                            />
                                        </div>

                                        <span className="mt-4 text-center text-sm font-semibold text-gray-800 transition group-hover:text-emerald-600">
                                            {
                                                category.name
                                            }
                                        </span>
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